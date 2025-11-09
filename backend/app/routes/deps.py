from collections.abc import Generator
from typing import Annotated, Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from core import security
from core.config import settings
from core.db import engine
from models.auth.users import TokenPayload, User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


def check_user_permissions(
    session: Session, user: User, required_permissions: list[str]
) -> bool:
    """
    Verificar si un usuario tiene todos los permisos requeridos.
    Verifica permisos directos y permisos heredados de roles.
    Los superusuarios tienen todos los permisos automáticamente.
    """
    # Los superusuarios tienen todos los permisos
    if user.is_superuser:
        return True

    # Importar aquí para evitar dependencias circulares
    from app.routes.auth.permisos.crud import get_user_all_permissions

    user_permissions = get_user_all_permissions(session=session, user_id=user.id)

    # Verificar si el usuario tiene todos los permisos requeridos
    return all(perm in user_permissions for perm in required_permissions)


def require_permissions(*required_permissions: str) -> Callable:
    """
    Dependencia de FastAPI para requerir permisos específicos.
    
    Uso:
        @router.get("/endpoint", dependencies=[Depends(require_permissions("permiso1", "permiso2"))])
        def endpoint_protegido():
            ...
    
    Args:
        *required_permissions: Nombres de los permisos requeridos
    
    Returns:
        Una función que verifica los permisos
    """

    def permission_checker(session: SessionDep, current_user: CurrentUser) -> User:
        if not check_user_permissions(
            session=session, user=current_user, required_permissions=list(required_permissions)
        ):
            raise HTTPException(
                status_code=403,
                detail=f"Se requieren los siguientes permisos: {', '.join(required_permissions)}",
            )
        return current_user

    return permission_checker


def require_any_permission(*required_permissions: str) -> Callable:
    """
    Dependencia de FastAPI para requerir al menos uno de los permisos especificados.
    
    Uso:
        @router.get("/endpoint", dependencies=[Depends(require_any_permission("permiso1", "permiso2"))])
        def endpoint_protegido():
            ...
    
    Args:
        *required_permissions: Nombres de los permisos, de los cuales al menos uno debe cumplirse
    
    Returns:
        Una función que verifica los permisos
    """

    def permission_checker(session: SessionDep, current_user: CurrentUser) -> User:
        # Los superusuarios tienen todos los permisos
        if current_user.is_superuser:
            return current_user

        # Importar aquí para evitar dependencias circulares
        from app.routes.auth.permisos.crud import get_user_all_permissions

        user_permissions = get_user_all_permissions(session=session, user_id=current_user.id)

        # Verificar si el usuario tiene al menos uno de los permisos requeridos
        if not any(perm in user_permissions for perm in required_permissions):
            raise HTTPException(
                status_code=403,
                detail=f"Se requiere al menos uno de los siguientes permisos: {', '.join(required_permissions)}",
            )

        return current_user

    return permission_checker
