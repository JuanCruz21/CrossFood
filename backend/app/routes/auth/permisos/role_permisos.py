import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.routes.auth.permisos import crud
from app.routes.auth.roles import crud as roles_crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.auth.permiso import PermisoPublic, PermisosPublic
from models.auth.permisorol import PermisoRolPublic
from models.config import Message

router = APIRouter(prefix="/role-permisos", tags=["role-permisos"])


class AssignPermisoToRolRequest(BaseModel):
    """Request para asignar un permiso a un rol."""

    permiso_id: uuid.UUID
    rol_id: uuid.UUID


class RemovePermisoFromRolRequest(BaseModel):
    """Request para remover un permiso de un rol."""

    permiso_id: uuid.UUID
    rol_id: uuid.UUID


@router.post(
    "/assign",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoRolPublic,
)
def assign_permiso_to_rol(
    *, session: SessionDep, request: AssignPermisoToRolRequest, current_user: CurrentUser
) -> Any:
    """
    Asignar un permiso a un rol.
    Solo accesible para superusuarios.
    """
    # Verificar que el permiso existe
    permiso = crud.get_permiso_by_id(session=session, permiso_id=request.permiso_id)
    if not permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )

    # Verificar que el rol existe
    rol = roles_crud.get_rol_by_id(session=session, rol_id=request.rol_id)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )

    # Asignar el permiso al rol
    permiso_rol = crud.assign_permiso_to_rol(
        session=session,
        permiso_id=request.permiso_id,
        rol_id=request.rol_id,
        assigned_by=current_user.id,
    )

    return permiso_rol


@router.post(
    "/remove",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def remove_permiso_from_rol(
    *, session: SessionDep, request: RemovePermisoFromRolRequest
) -> Any:
    """
    Remover un permiso de un rol.
    Solo accesible para superusuarios.
    """
    # Verificar que el rol existe
    rol = roles_crud.get_rol_by_id(session=session, rol_id=request.rol_id)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )

    # Intentar remover la asignación
    removed = crud.remove_permiso_from_rol(
        session=session, permiso_id=request.permiso_id, rol_id=request.rol_id
    )

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="El rol no tiene asignado ese permiso.",
        )

    return Message(message="Permiso removido exitosamente del rol")


@router.get(
    "/rol/{rol_id}/permisos",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisosPublic,
)
def get_rol_permissions(rol_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener todos los permisos asignados a un rol.
    Solo accesible para superusuarios.
    """
    # Verificar que el rol existe
    rol = roles_crud.get_rol_by_id(session=session, rol_id=rol_id)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )

    permisos = crud.get_rol_permissions_list(session=session, rol_id=rol_id)
    permiso_public_list = [PermisoPublic.model_validate(permiso) for permiso in permisos]

    return PermisosPublic(data=permiso_public_list, count=len(permiso_public_list))
