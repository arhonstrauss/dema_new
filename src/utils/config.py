import os
from typing import Optional
from pydantic import BaseModel


class Config(BaseModel):
    """Application configuration"""
    xai_api_key: Optional[str] = None
    
    @classmethod
    def from_env(cls, env_file: str = ".env") -> "Config":
        """Load configuration from environment variables"""
        # Note: load_dotenv should be called before this method
        
        return cls(
            xai_api_key=os.getenv("XAI_API_KEY")
        )
