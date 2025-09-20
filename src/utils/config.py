import os
from typing import Optional
from pydantic import BaseModel


class Config(BaseModel):
    """Application configuration"""
    xai_api_key: Optional[str] = None
    screenshots_dir: str = "screenshots"
    max_steps: int = 50
    headless: bool = False
    
    @classmethod
    def from_env(cls, env_file: str = ".env") -> "Config":
        """Load configuration from environment variables"""
        # Note: load_dotenv should be called before this method
        
        return cls(
            xai_api_key=os.getenv("XAI_API_KEY"),
            screenshots_dir=os.getenv("SCREENSHOTS_DIR", "screenshots"),
            max_steps=int(os.getenv("MAX_STEPS", "50")),
            headless=os.getenv("HEADLESS", "false").lower() == "true"
        )
