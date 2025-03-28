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
        # Fetch tasks for the user
        response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
        
        if not response.data:
            error_message = response.json().get("message", "Unknown error")
            raise HTTPException(status_code=500, detail=f"Supabase error: {error_message}")
        
        tasks = response.data
        
        # Log the tasks being returned
        print(f"Fetched tasks for user {user_id}: {tasks}")
        
        return {"error": False, "tasks": tasks}
    except Exception as e:
        print(f"Get tasks error: {str(e)}")
        return {"error": True, "tasks": []}

@router.post("/create", response_model=TaskResponse)
async def create_task(task: TaskCreate, user_id: str = Depends(get_current_user)):
    try:
        # Ensure Supabase client is properly initialized
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise HTTPException(status_code=500, detail="Supabase configuration is missing")

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
        
        # Insert task into the database
        response = supabase.table("tasks").insert(task_data).execute()
        
        if not response.data:
            error_message = response.json().get("message", "Unknown error")
            raise HTTPException(status_code=500, detail=f"Supabase error: {error_message}")
            
        return response.data[0]
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions to preserve status codes
        raise http_exc
    except Exception as e:
        print(f"Create task error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while creating the task")

@router.put("/update/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: TaskUpdate, user_id: str = Depends(get_current_user)):
    try:
        # First verify the task belongs to the user
        verify_response = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", user_id).execute()
        
        if not verify_response.data:
            error_message = verify_response.json().get("message", "Task not found or unauthorized")
            raise HTTPException(status_code=404, detail=error_message)
        
        # Build update data removing None values
        update_data = {k: v for k, v in task.dict().items() if v is not None}
        
        # Handle datetime conversion
        if task.dueDate:
            update_data["dueDate"] = task.dueDate.isoformat()
        
        response = supabase.table("tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            error_message = response.json().get("message", "Failed to update task")
            raise HTTPException(status_code=500, detail=error_message)
            
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
            error_message = verify_response.json().get("message", "Task not found or unauthorized")
            raise HTTPException(status_code=404, detail=error_message)
        
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            error_message = response.json().get("message", "Failed to delete task")
            raise HTTPException(status_code=500, detail=error_message)
        
        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        print(f"Delete task error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
