from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    category: str
    priority: str
    completed: bool = False
    dueDate: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    dueDate: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str  # String ID
    user_id: str  # String user ID
    title: str
    category: str
    priority: str
    completed: bool
    dueDate: Optional[datetime] = None
    
class TasksResponse(BaseModel):
    error: bool
    tasks: List[TaskResponse] = []
