import os
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv


class Config(BaseModel):
    """Application configuration"""
    openai_api_key: Optional[str] = None
    screenshots_dir: str = "screenshots"
    max_steps: int = 50
    headless: bool = False
    
    @classmethod
    def from_env(cls, env_file: str = ".env") -> "Config":
        """Load configuration from environment variables"""
        load_dotenv(env_file)
        
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            screenshots_dir=os.getenv("SCREENSHOTS_DIR", "screenshots"),
            max_steps=int(os.getenv("MAX_STEPS", "50")),
            headless=os.getenv("HEADLESS", "false").lower() == "true"
        ) 