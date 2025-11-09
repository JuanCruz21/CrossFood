import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from app.routes.auth.roles import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.auth.rol import RolPublic, RolesPublic
from models.auth.roluser import RolUserPublic
from models.auth.users import User
from models.config import Message

router = APIRouter(prefix="/user-roles", tags=["user-roles"])


class AssignRolRequest(BaseModel):
    """Request para asignar un rol a un usuario."""

    user_id: uuid.UUID
    rol_id: uuid.UUID


class RemoveRolRequest(BaseModel):
    """Request para remover un rol de un usuario."""

    user_id: uuid.UUID
    rol_id: uuid.UUID


@router.post(
    "/assign",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RolUserPublic,
)
def assign_rol_to_user(
    *, session: SessionDep, request: AssignRolRequest, current_user: CurrentUser
) -> Any:
    """
    Asignar un rol a un usuario.
    Solo accesible para superusuarios.
    """
    # Verificar que el usuario existe
    user = session.get(User, request.user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario con este ID no existe en el sistema.",
        )

    # Verificar que el rol existe
    rol = crud.get_rol_by_id(session=session, rol_id=request.rol_id)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )

    # Asignar el rol
    rol_user = crud.assign_rol_to_user(
        session=session,
        user_id=request.user_id,
        rol_id=request.rol_id,
        assigned_by=current_user.id,
    )

    return rol_user


@router.post(
    "/remove",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def remove_rol_from_user(*, session: SessionDep, request: RemoveRolRequest) -> Any:
    """
    Remover un rol de un usuario.
    Solo accesible para superusuarios.
    """
    # Verificar que el usuario existe
    user = session.get(User, request.user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario con este ID no existe en el sistema.",
        )

    # Intentar remover la asignación
    removed = crud.remove_rol_from_user(
        session=session, user_id=request.user_id, rol_id=request.rol_id
    )

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="El usuario no tiene asignado ese rol.",
        )

    return Message(message="Rol removido exitosamente del usuario")


@router.get(
    "/user/{user_id}/roles",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RolesPublic,
)
def get_user_roles(user_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener todos los roles asignados a un usuario.
    Solo accesible para superusuarios.
    """
    # Verificar que el usuario existe
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario con este ID no existe en el sistema.",
        )

    roles = crud.get_user_roles(session=session, user_id=user_id)
    rol_public_list = [RolPublic.model_validate(rol) for rol in roles]

    return RolesPublic(data=rol_public_list, count=len(rol_public_list))


@router.get("/me/roles", response_model=RolesPublic)
def get_my_roles(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Obtener todos los roles del usuario actual.
    Accesible para el propio usuario.
    """
    roles = crud.get_user_roles(session=session, user_id=current_user.id)
    rol_public_list = [RolPublic.model_validate(rol) for rol in roles]

    return RolesPublic(data=rol_public_list, count=len(rol_public_list))


@router.get(
    "/rol/{rol_id}/users",
    dependencies=[Depends(get_current_active_superuser)],
)
def get_users_with_rol(rol_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener todos los usuarios que tienen un rol específico.
    Solo accesible para superusuarios.
    """
    # Verificar que el rol existe
    rol = crud.get_rol_by_id(session=session, rol_id=rol_id)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )

    user_ids = crud.get_users_with_rol(session=session, rol_id=rol_id)

    return {"rol_id": rol_id, "rol_name": rol.nombre, "user_ids": user_ids, "count": len(user_ids)}
