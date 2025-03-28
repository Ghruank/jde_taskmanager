from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os
from auth import hashed_pass, verify_hash_pass, jwt_encode
import uuid
from models import userReqMod, userResMod, loginReqMod

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/login", response_model=userResMod)
async def login(req: loginReqMod):
    try:
        response = supabase.table("users").select("uid, password, username").eq("email", req.email).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        user = response.data[0]
        if not verify_hash_pass(req.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        token = jwt_encode(user["uid"])
        return {"error": False, "token": token, "username": user["username"]}
    except Exception as e:
        print(f"Login error: {str(e)}")
        return {"error": True, "token": "", "username": ""}

@router.post("/register", response_model=userResMod)
async def register(req: userReqMod):
    try:
        response = supabase.table("users").select("uid").eq("email", req.email).execute()
        
        if response.data:
            return {"error": True, "token": "", "username": ""}
            
        user_id = str(uuid.uuid4())
        hash_pass = hashed_pass(req.password)
        
        # Insert into users table, not login table
        response = supabase.table("users").insert({
            "uid": user_id,
            "email": req.email,
            "password": hash_pass,
            "username": req.username
        }).execute()
        
        if not response.data:
            return {"error": True, "token": "", "username": ""}
            
        token = jwt_encode(user_id)
        return {"error": False, "token": token, "username": req.username}
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return {"error": True, "token": "", "username": ""}
