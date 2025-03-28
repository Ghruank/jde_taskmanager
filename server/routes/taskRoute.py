from fastapi import APIRouter, HTTPException, Header, Depends
from supabase import create_client, Client
import os
from typing import List, Optional
import uuid
from models.taskModel import TaskCreate, TaskUpdate, TaskResponse, TasksResponse
from auth import verify_token, JWT_SECRET

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user_id

@router.get("/all", response_model=TasksResponse)
async def get_tasks(user_id: str = Depends(get_current_user)):
    try:
        response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
        
        if not response.data:
            return {"error": False, "tasks": []}
        
        return {"error": False, "tasks": response.data}
    except Exception as e:
        print(f"Get tasks error: {str(e)}")
        return {"error": True, "tasks": []}

@router.post("/create", response_model=TaskResponse)
async def create_task(task: TaskCreate, user_id: str = Depends(get_current_user)):
    try:
        # Generate a string ID instead of UUID
        task_id = str(uuid.uuid4())
        
        task_data = {
            "id": task_id,
            "user_id": user_id,  # user_id is already a string
            "title": task.title,
            "category": task.category,
            "priority": task.priority,
            "completed": task.completed,
            "dueDate": task.dueDate.isoformat() if task.dueDate else None
        }
        
        response = supabase.table("tasks").insert(task_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create task")
            
        return response.data[0]
    except Exception as e:
        print(f"Create task error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: TaskUpdate, user_id: str = Depends(get_current_user)):
    try:
        # First verify the task belongs to the user
        verify_response = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", user_id).execute()
        
        if not verify_response.data:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        
        # Build update data removing None values
        update_data = {k: v for k, v in task.dict().items() if v is not None}
        
        # Handle datetime conversion
        if task.dueDate:
            update_data["dueDate"] = task.dueDate.isoformat()
        
        response = supabase.table("tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update task")
            
        return response.data[0]
    except Exception as e:
        print(f"Update task error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{task_id}")
async def delete_task(task_id: str, user_id: str = Depends(get_current_user)):
    try:
        # First verify the task belongs to the user
        verify_response = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", user_id).execute()
        
        if not verify_response.data:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        
        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        print(f"Delete task error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
