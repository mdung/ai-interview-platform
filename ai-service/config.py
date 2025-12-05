from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    # Backend API
    backend_url: str = "http://localhost:8080"
    backend_api_key: Optional[str] = None
    
    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    
    # ASR
    asr_model: str = "base"  # whisper model size
    asr_device: str = "cpu"  # or "cuda"
    
    # TTS
    tts_model: str = "tts_models/en/ljspeech/tacotron2-DDC"
    tts_device: str = "cpu"
    
    # VAD
    vad_model: str = "silero_vad"
    vad_threshold: float = 0.5
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

