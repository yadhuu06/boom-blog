from fastapi import APIRouter, Depends, HTTPException, status,Response
from sqlalchemy.orm import Session
from datetime import timedelta
import logging
from jose import  JWTError
from app.schemas.auth_schema import LoginRequest, AuthResponse
from app.crud.user_crud import get_user_by_email, create_user
from app.utils.security import verify_password, create_access_token,decode_token,oauth2_refresh_scheme,create_refresh_token
from app.db.database import get_db
from app.core.config import settings
from app.schemas.user_schema import UserCreate

router = APIRouter(prefix="", tags=["Authentication"])


@router.post("/login_or_register", response_model=AuthResponse)
def login_or_register(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    try:
        user = get_user_by_email(db, request.email)

        if user:
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is blocked"
                )
            if not verify_password(request.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid password"
                )
        else:
            user = create_user(db, UserCreate(email=request.email, password=request.password))

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(days=7)
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,    
            samesite="strict",
            max_age=60 * 60 * 24 * 7,
            path="/",
        )

        return {
            "user": user,
            "access_token": access_token,
            "token_type": "bearer",
        }

    except HTTPException:
        raise
    except Exception:
        logging.exception("Unexpected error during login_or_register")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again later."
        )

@router.post("/refresh")
def refresh_access_token(token: str = Depends(oauth2_refresh_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    new_access = create_access_token({"sub": user_id})
    return {"access_token": new_access, "token_type": "bearer"}

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):

    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="strict"
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)