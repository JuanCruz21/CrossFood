import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.auth.permisos import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.auth.permiso import (
    Permiso,
    PermisoCreate,
    PermisoPublic,
    PermisosPublic,
    PermisoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/permisos", tags=["permisos"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisosPublic,
)
def read_permisos(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Obtener lista de permisos.
    Solo accesible para superusuarios.
    """
    count_statement = select(func.count()).select_from(Permiso)
    count = session.exec(count_statement).one()

    statement = select(Permiso).offset(skip).limit(limit)
    permisos = session.exec(statement).all()
    permiso_public_list = [PermisoPublic.model_validate(permiso) for permiso in permisos]

    return PermisosPublic(data=permiso_public_list, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoPublic,
)
def create_permiso(*, session: SessionDep, permiso_in: PermisoCreate) -> Any:
    """
    Crear un nuevo permiso.
    Solo accesible para superusuarios.
    """
    # Verificar si ya existe un permiso con ese nombre
    existing_permiso = crud.get_permiso_by_name(session=session, name=permiso_in.nombre)
    if existing_permiso:
        raise HTTPException(
            status_code=400,
            detail="Un permiso con este nombre ya existe en el sistema.",
        )

    permiso = crud.create_permiso(session=session, permiso_create=permiso_in)
    return permiso


@router.get(
    "/{permiso_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoPublic,
)
def read_permiso_by_id(permiso_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener un permiso específico por ID.
    Solo accesible para superusuarios.
    """
    permiso = crud.get_permiso_by_id(session=session, permiso_id=permiso_id)
    if not permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )
    return permiso


@router.patch(
    "/{permiso_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoPublic,
)
def update_permiso(
    *,
    session: SessionDep,
    permiso_id: uuid.UUID,
    permiso_in: PermisoUpdate,
) -> Any:
    """
    Actualizar un permiso.
    Solo accesible para superusuarios.
    """
    db_permiso = crud.get_permiso_by_id(session=session, permiso_id=permiso_id)
    if not db_permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )

    # Verificar que no exista otro permiso con el mismo nombre
    if permiso_in.nombre:
        existing_permiso = crud.get_permiso_by_name(session=session, name=permiso_in.nombre)
        if existing_permiso and existing_permiso.id != permiso_id:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro permiso con este nombre.",
            )

    permiso = crud.update_permiso(
        session=session, db_permiso=db_permiso, permiso_in=permiso_in
    )
    return permiso


@router.delete(
    "/{permiso_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_permiso(permiso_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Eliminar un permiso.
    Solo accesible para superusuarios.
    """
    deleted = crud.delete_permiso(session=session, permiso_id=permiso_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )
    return Message(message="Permiso eliminado exitosamente")


@router.get("/name/{permiso_name}", response_model=PermisoPublic)
def read_permiso_by_name(
    permiso_name: str, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Obtener un permiso específico por nombre.
    Accesible para usuarios autenticados.
    """
    permiso = crud.get_permiso_by_name(session=session, name=permiso_name)
    if not permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este nombre no existe en el sistema.",
        )
    return permiso
