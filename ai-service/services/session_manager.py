import logging
import json
import redis
import httpx
from typing import Dict, Optional
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


class SessionManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            decode_responses=False
        )
        self.backend_url = settings.backend_url
    
    async def get_or_create_session(self, session_id: str) -> Dict:
        """Get session state from Redis or fetch from backend"""
        try:
            # Try Redis first
            cached = self.redis_client.get(f"session:{session_id}")
            if cached:
                return json.loads(cached)
            
            # Fetch from backend
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.backend_url}/api/interviews/sessions/{session_id}",
                    headers={"Authorization": f"Bearer {settings.backend_api_key}"} if settings.backend_api_key else {}
                )
                response.raise_for_status()
                session_data = response.json()
            
            # Build session state
            session_state = {
                "sessionId": session_id,
                "candidateId": session_data.get("candidateId"),
                "templateId": session_data.get("templateId"),
                "language": session_data.get("language", "en"),
                "status": session_data.get("status"),
                "conversationHistory": [],
                "currentQuestion": None,
                "job": {},  # Will be populated from template
                "template": {}
            }
            
            # Cache in Redis
            self.redis_client.setex(
                f"session:{session_id}",
                3600,  # 1 hour TTL
                json.dumps(session_state)
            )
            
            return session_state
        except Exception as e:
            logger.error(f"Error getting session: {e}", exc_info=True)
            return {
                "sessionId": session_id,
                "conversationHistory": [],
                "language": "en"
            }
    
    async def get_session(self, session_id: str) -> Dict:
        """Get session state"""
        cached = self.redis_client.get(f"session:{session_id}")
        if cached:
            return json.loads(cached)
        return await self.get_or_create_session(session_id)
    
    async def add_answer(self, session_id: str, answer: str) -> Dict:
        """Add answer to conversation history"""
        session_state = await self.get_session(session_id)
        history = session_state.get("conversationHistory", [])
        
        # Add answer to last turn if exists
        if history and history[-1].get("question") and not history[-1].get("answer"):
            history[-1]["answer"] = answer
            history[-1]["answerTimestamp"] = datetime.now().isoformat()
        else:
            # Create new turn
            history.append({
                "answer": answer,
                "answerTimestamp": datetime.now().isoformat()
            })
        
        session_state["conversationHistory"] = history
        
        # Update Redis
        self.redis_client.setex(
            f"session:{session_id}",
            3600,
            json.dumps(session_state)
        )
        
        return session_state
    
    async def add_question(self, session_id: str, question: str) -> Dict:
        """Add question to conversation history"""
        session_state = await self.get_session(session_id)
        history = session_state.get("conversationHistory", [])
        
        # Add new turn with question
        history.append({
            "question": question,
            "questionTimestamp": datetime.now().isoformat()
        })
        
        session_state["conversationHistory"] = history
        session_state["currentQuestion"] = question
        
        # Update Redis
        self.redis_client.setex(
            f"session:{session_id}",
            3600,
            json.dumps(session_state)
        )
        
        return session_state
    
    async def complete_session(self, session_id: str, evaluation: Dict):
        """Mark session as completed and send evaluation to backend"""
        try:
            async with httpx.AsyncClient() as client:
                # Update session status
                await client.put(
                    f"{self.backend_url}/api/interviews/sessions/{session_id}/status",
                    params={"status": "COMPLETED"},
                    headers={"Authorization": f"Bearer {settings.backend_api_key}"} if settings.backend_api_key else {}
                )
                
                # Send evaluation (would need a dedicated endpoint)
                logger.info(f"Session {session_id} completed with evaluation: {evaluation}")
        except Exception as e:
            logger.error(f"Error completing session: {e}", exc_info=True)
    
    async def cleanup_session(self, session_id: str):
        """Clean up session from Redis"""
        try:
            self.redis_client.delete(f"session:{session_id}")
        except Exception as e:
            logger.error(f"Error cleaning up session: {e}")

