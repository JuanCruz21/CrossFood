import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.routes.auth.permisos import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.auth.permiso import PermisoPublic, PermisosPublic
from models.auth.permisousuario import PermisoUsuarioPublic
from models.auth.users import User
from models.config import Message

router = APIRouter(prefix="/user-permisos", tags=["user-permisos"])


class AssignPermisoToUserRequest(BaseModel):
    """Request para asignar un permiso directamente a un usuario."""

    permiso_id: uuid.UUID
    user_id: uuid.UUID


class RemovePermisoFromUserRequest(BaseModel):
    """Request para remover un permiso directo de un usuario."""

    permiso_id: uuid.UUID
    user_id: uuid.UUID


@router.post(
    "/assign",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoUsuarioPublic,
)
def assign_permiso_to_user(
    *, session: SessionDep, request: AssignPermisoToUserRequest
) -> Any:
    """
    Asignar un permiso directamente a un usuario (sin rol).
    Solo accesible para superusuarios.
    """
    # Verificar que el usuario existe
    user = session.get(User, request.user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario con este ID no existe en el sistema.",
        )

    # Verificar que el permiso existe
    permiso = crud.get_permiso_by_id(session=session, permiso_id=request.permiso_id)
    if not permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )

    # Asignar el permiso al usuario
    permiso_usuario = crud.assign_permiso_to_user(
        session=session, permiso_id=request.permiso_id, user_id=request.user_id
    )

    return permiso_usuario


@router.post(
    "/remove",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def remove_permiso_from_user(
    *, session: SessionDep, request: RemovePermisoFromUserRequest
) -> Any:
    """
    Remover un permiso directo de un usuario.
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
    removed = crud.remove_permiso_from_user(
        session=session, permiso_id=request.permiso_id, user_id=request.user_id
    )

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="El usuario no tiene asignado ese permiso de forma directa.",
        )

    return Message(message="Permiso removido exitosamente del usuario")


@router.get(
    "/user/{user_id}/permisos/direct",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisosPublic,
)
def get_user_direct_permissions(user_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener todos los permisos asignados directamente a un usuario (sin contar los de roles).
    Solo accesible para superusuarios.
    """
    # Verificar que el usuario existe
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario con este ID no existe en el sistema.",
        )

    permisos = crud.get_user_direct_permissions(session=session, user_id=user_id)
    permiso_public_list = [PermisoPublic.model_validate(permiso) for permiso in permisos]

    return PermisosPublic(data=permiso_public_list, count=len(permiso_public_list))


@router.get(
    "/user/{user_id}/permisos/all",
    dependencies=[Depends(get_current_active_superuser)],
)
def get_user_all_permissions(user_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener todos los permisos de un usuario (directos + por roles).
    Solo accesible para superusuarios.
    """
    # Verificar que el usuario existe
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario con este ID no existe en el sistema.",
        )

    permisos_set = crud.get_user_all_permissions(session=session, user_id=user_id)

    return {
        "user_id": user_id,
        "permissions": sorted(list(permisos_set)),
        "count": len(permisos_set),
    }


@router.get("/me/permisos", response_model=dict)
def get_my_permissions(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Obtener todos los permisos del usuario actual (directos + por roles).
    Accesible para el propio usuario.
    """
    permisos_set = crud.get_user_all_permissions(
        session=session, user_id=current_user.id
    )

    return {
        "user_id": current_user.id,
        "permissions": sorted(list(permisos_set)),
        "count": len(permisos_set),
    }


@router.get("/me/permisos/direct", response_model=PermisosPublic)
def get_my_direct_permissions(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Obtener los permisos directos del usuario actual (sin contar los de roles).
    Accesible para el propio usuario.
    """
    permisos = crud.get_user_direct_permissions(
        session=session, user_id=current_user.id
    )
    permiso_public_list = [PermisoPublic.model_validate(permiso) for permiso in permisos]

    return PermisosPublic(data=permiso_public_list, count=len(permiso_public_list))
