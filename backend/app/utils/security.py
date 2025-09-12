from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
from fastapi.security import OAuth2PasswordBearer


oauth2_refresh_scheme = OAuth2PasswordBearer(tokenUrl="/auth/refresh")
# -------- Password hashing context -------- #
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------- Password utilities -------- #
def get_password_hash(password: str) -> str:
    """Hash the given password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify the given plain password against the hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

# -------- JWT Token utilities -------- #
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    - data: Dict containing the claims (e.g., {"sub": user_email})
    - expires_delta: Custom expiration timedelta (optional)
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT refresh token (longer expiration than access token).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None

def get_token_expiry_time(token: str) -> Optional[datetime]:
    """
    Return the expiration datetime of a token, or None if invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp_timestamp = payload.get("exp")
        print("TOKEN RECEIVED:", token)
        return datetime.utcfromtimestamp(exp_timestamp) if exp_timestamp else None
        

    except JWTError:
        print("jwt error")
        return None
