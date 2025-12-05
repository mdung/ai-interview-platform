from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import asyncio
from typing import Dict, Optional
import logging

from services.voice_service import VoiceService
from services.llm_service import LLMService
from services.session_manager import SessionManager
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Interview Voice Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
voice_service = VoiceService()
llm_service = LLMService()
session_manager = SessionManager()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/interview/{session_id}")
async def websocket_interview(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connection established for session: {session_id}")
    
    try:
        # Initialize session
        session_state = await session_manager.get_or_create_session(session_id)
        
        # Send initial greeting/question
        initial_question = await llm_service.get_initial_question(session_state)
        await voice_service.send_text_response(websocket, initial_question)
        
        # Start listening loop
        while True:
            try:
                # Receive audio chunk or text message
                data = await websocket.receive()
                
                if "bytes" in data:
                    # Audio chunk received
                    audio_chunk = data["bytes"]
                    await process_audio_chunk(websocket, session_id, audio_chunk)
                    
                elif "text" in data:
                    # Text message received (for text mode)
                    message = json.loads(data["text"])
                    await process_text_message(websocket, session_id, message)
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for session: {session_id}")
                break
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
                
    except Exception as e:
        logger.error(f"Error in WebSocket handler: {e}", exc_info=True)
    finally:
        await session_manager.cleanup_session(session_id)


async def process_audio_chunk(websocket: WebSocket, session_id: str, audio_chunk: bytes):
    """Process incoming audio chunk with VAD and ASR"""
    try:
        # Detect voice activity
        is_speech = await voice_service.detect_speech(audio_chunk)
        
        if is_speech:
            # Stop TTS if playing (barge-in)
            await voice_service.stop_tts()
            
            # Process with ASR
            transcript = await voice_service.transcribe_audio(audio_chunk)
            
            if transcript:
                # Update session with answer
                session_state = await session_manager.add_answer(session_id, transcript)
                
                # Get next question from LLM
                next_question = await llm_service.get_next_question(session_state, transcript)
                
                # Send response (text + optional TTS audio)
                await voice_service.send_text_response(websocket, next_question)
                
                # Optionally send TTS audio
                if session_state.get("mode") == "voice":
                    audio_data = await voice_service.text_to_speech(next_question)
                    await voice_service.send_audio_response(websocket, audio_data)
                    
    except Exception as e:
        logger.error(f"Error processing audio chunk: {e}", exc_info=True)


async def process_text_message(websocket: WebSocket, session_id: str, message: Dict):
    """Process text message (for text mode interviews)"""
    try:
        message_type = message.get("type")
        
        if message_type == "answer":
            answer = message.get("text", "")
            session_state = await session_manager.add_answer(session_id, answer)
            
            # Get next question from LLM
            next_question = await llm_service.get_next_question(session_state, answer)
            
            await websocket.send_json({
                "type": "question",
                "text": next_question
            })
            
        elif message_type == "end_interview":
            # Generate final evaluation
            session_state = await session_manager.get_session(session_id)
            evaluation = await llm_service.generate_evaluation(session_state)
            
            await websocket.send_json({
                "type": "evaluation",
                "data": evaluation
            })
            
            # Update session in backend
            await session_manager.complete_session(session_id, evaluation)
            
    except Exception as e:
        logger.error(f"Error processing text message: {e}", exc_info=True)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

