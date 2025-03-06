from fastapi import Security, HTTPException
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import HTTPAuthorizationCredentials
from services.config import settings


def create_jwt_token(data: dict, expires_delta: timedelta):

    expire = datetime.utcnow() + expires_delta
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(settings.BEARER_SECURITY)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def verify_jwt_socket(token: str):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
