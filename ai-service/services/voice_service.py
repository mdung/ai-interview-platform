import asyncio
import numpy as np
import logging
from typing import Optional, Dict
import json
import io

try:
    import whisper
    import torch
    from silero_vad import load_silero_vad_model, get_speech_timestamps
    from TTS.api import TTS
except ImportError:
    logging.warning("Voice processing libraries not available. Install with: pip install whisper torch silero-vad coqui-tts")

from config import settings

logger = logging.getLogger(__name__)


class VoiceService:
    def __init__(self):
        self.asr_model = None
        self.vad_model = None
        self.tts_model = None
        self.current_tts_task = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ASR, VAD, and TTS models"""
        try:
            # Initialize Whisper ASR
            if settings.asr_device == "cuda" and torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
            
            logger.info(f"Loading Whisper model ({settings.asr_model}) on {device}")
            self.asr_model = whisper.load_model(settings.asr_model, device=device)
            
            # Initialize Silero VAD
            logger.info("Loading Silero VAD model")
            self.vad_model, utils = load_silero_vad_model()
            self.vad_utils = utils
            
            # Initialize Coqui TTS
            logger.info(f"Loading TTS model: {settings.tts_model}")
            self.tts_model = TTS(model_name=settings.tts_model, progress_bar=False)
            
            logger.info("Voice service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing voice models: {e}", exc_info=True)
    
    async def detect_speech(self, audio_chunk: bytes) -> bool:
        """Detect if audio chunk contains speech using VAD"""
        try:
            # Convert bytes to numpy array
            audio_array = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Run VAD
            speech_timestamps = get_speech_timestamps(
                audio_array,
                self.vad_model,
                threshold=settings.vad_threshold,
                **self.vad_utils
            )
            
            return len(speech_timestamps) > 0
        except Exception as e:
            logger.error(f"Error in VAD: {e}")
            return False
    
    async def transcribe_audio(self, audio_chunk: bytes) -> Optional[str]:
        """Transcribe audio chunk to text using Whisper"""
        try:
            if not self.asr_model:
                return None
            
            # Convert bytes to numpy array
            audio_array = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Transcribe
            result = self.asr_model.transcribe(audio_array, language="en", fp16=False)
            transcript = result["text"].strip()
            
            if transcript:
                logger.info(f"Transcribed: {transcript}")
            
            return transcript if transcript else None
        except Exception as e:
            logger.error(f"Error in ASR: {e}", exc_info=True)
            return None
    
    async def text_to_speech(self, text: str) -> Optional[bytes]:
        """Convert text to speech audio"""
        try:
            if not self.tts_model:
                return None
            
            # Generate audio
            wav = self.tts_model.tts(text=text)
            
            # Convert to bytes
            audio_bytes = (wav * 32767).astype(np.int16).tobytes()
            return audio_bytes
        except Exception as e:
            logger.error(f"Error in TTS: {e}", exc_info=True)
            return None
    
    async def stop_tts(self):
        """Stop current TTS playback (barge-in handling)"""
        if self.current_tts_task:
            self.current_tts_task.cancel()
            self.current_tts_task = None
    
    async def send_text_response(self, websocket, text: str):
        """Send text response via WebSocket"""
        await websocket.send_json({
            "type": "question",
            "text": text
        })
    
    async def send_audio_response(self, websocket, audio_data: bytes):
        """Send audio response via WebSocket"""
        await websocket.send_bytes(audio_data)

