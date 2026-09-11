import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ResQ-Link AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(Path(__file__).resolve().parent.parent / "uploads")))
    
    FACE_IMAGE_SIZE: int = 160
    FACE_MARGIN: int = 20
    MIN_FACE_SIZE: int = 20
    DEVICE: str = "cpu"
    
    WEIGHT_FACE_NORMAL: float = 0.40
    WEIGHT_PHONETIC_NORMAL: float = 0.35
    WEIGHT_DEMOGRAPHIC_NORMAL: float = 0.15
    WEIGHT_MARKS_NORMAL: float = 0.10
    
    WEIGHT_PHONETIC_FALLBACK: float = 0.70
    WEIGHT_DEMOGRAPHIC_FALLBACK: float = 0.20
    WEIGHT_MARKS_FALLBACK: float = 0.10
    
    REVIEW_THRESHOLD: float = 0.60
    MAX_AGE_DELTA_TOLERANCE: float = 10.0
    
    class Config:
        env_prefix = "RESQLINK_"
        case_sensitive = True
        
settings = Settings()

settings.UPLOAD_DIR.mkdir(parents = True, exist_ok = True)