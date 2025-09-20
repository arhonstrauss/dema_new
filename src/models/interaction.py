from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class InteractionType(Enum):
    CLICK = "click"
    INPUT = "input"
    NAVIGATE = "navigate"
    SCREENSHOT = "screenshot"
    SCROLL = "scroll"


class Interaction(BaseModel):
    """Represents a single interaction with a web element or page"""
    id: str
    type: InteractionType
    timestamp: datetime
    url: str
    selector: Optional[str] = None
    value: Optional[str] = None
    screenshot_path: Optional[str] = None
    metadata: Dict[str, Any] = {}
    
    class Config:
        arbitrary_types_allowed = True 