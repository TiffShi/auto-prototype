from fastapi import APIRouter, HTTPException, status, Depends

from app.auth import create_access_token, get_current_user
from app.models.user import LoginRequest, TokenResponse, LogoutResponse
from app.services.user_service import get_user_by_username, validate_user_password

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and receive JWT",
)
async def login(request: LoginRequest):
    """
    Validate username and password against the mock user database.
    Returns a JWT access token on success.
    """
    user = get_user_by_username(request.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not validate_user_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token_data = {"sub": user.id, "username": user.username}
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=user.username,
        user_id=user.id,
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out the current user",
)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout endpoint. Since JWTs are stateless, the client is responsible
    for discarding the token. This endpoint confirms the action server-side.
    """
    return LogoutResponse(
        message=f"User '{current_user['username']}' logged out successfully."
    )