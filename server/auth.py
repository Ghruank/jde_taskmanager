from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from typing import Optional  # Add this import

load_dotenv()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

JWT_SECRET = os.getenv("SECRET_KEY")
if not JWT_SECRET:
    raise ValueError("SECRET_KEY environment variable is not set")

def hashed_pass(password: str) -> str:
    return pwd_context.hash(password)

def verify_hash_pass(plain_pass: str, hashed_pass: str) -> bool:
    return pwd_context.verify(plain_pass, hashed_pass)

ALGORITHM = 'HS256'

def jwt_encode(data: str) -> str:
    payload = {'sub': str(data)}
    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return token

def jwt_decode(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload['sub']
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        return None
    except Exception as e:
        print(f"Error decoding token: {str(e)}")
        return None

def verify_token(token: str) -> Optional[str]:
    """
    Verifies the validity of a JWT token and returns the user_id if valid.
    Returns None if the token is invalid.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload.get("sub")  # Return the user_id (subject) from the token
    except JWTError:
        return None
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        return None

