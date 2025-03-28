import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.authRoute import router as auth_router
from routes.taskRoute import router as task_router

load_dotenv()
app = FastAPI()

# Use environment variables for configuration
allowed_origin = [os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth")
app.include_router(task_router, prefix="/tasks")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),  # Use PORT from environment variables
        reload=True
    )
