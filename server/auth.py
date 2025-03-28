from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
load_dotenv()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def hashed_pass(password: str) -> str:
    return pwd_context.hash(password)

def verify_hash_pass(plain_pass: str, hashed_pass: str) -> bool:
    return pwd_context.verify(plain_pass, hashed_pass)

ALGORITHM = 'HS256'

def jwt_encode(data: str) -> str:
    payload = {'sub': str(data)}
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise ValueError("SECRET_KEY environment variable is not set")
    token = jwt.encode(payload, secret_key, algorithm=ALGORITHM)
    return token

def jwt_decode(token: str):
    try:
        secret_key = os.getenv("SECRET_KEY")
        if not secret_key:
            raise ValueError("SECRET_KEY environment variable is not set")
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        return payload['sub']
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        return None
    except Exception as e:
        print(f"Error decoding token: {str(e)}")
        return None
