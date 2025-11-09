import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.auth.roles import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.auth.rol import Rol, RolCreate, RolPublic, RolesPublic, RolUpdate
from models.config import Message

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RolesPublic,
)
def read_roles(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Obtener lista de roles.
    Solo accesible para superusuarios.
    """
    count_statement = select(func.count()).select_from(Rol)
    count = session.exec(count_statement).one()

    statement = select(Rol).offset(skip).limit(limit)
    roles = session.exec(statement).all()
    rol_public_list = [RolPublic.model_validate(rol) for rol in roles]

    return RolesPublic(data=rol_public_list, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RolPublic,
)
def create_rol(*, session: SessionDep, rol_in: RolCreate) -> Any:
    """
    Crear un nuevo rol.
    Solo accesible para superusuarios.
    """
    # Verificar si ya existe un rol con ese nombre
    existing_rol = crud.get_rol_by_name(session=session, name=rol_in.nombre)
    if existing_rol:
        raise HTTPException(
            status_code=400,
            detail="Un rol con este nombre ya existe en el sistema.",
        )

    rol = crud.create_rol(session=session, rol_create=rol_in)
    return rol


@router.get(
    "/{rol_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RolPublic,
)
def read_rol_by_id(rol_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener un rol específico por ID.
    Solo accesible para superusuarios.
    """
    rol = crud.get_rol_by_id(session=session, rol_id=rol_id)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )
    return rol


@router.patch(
    "/{rol_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RolPublic,
)
def update_rol(
    *,
    session: SessionDep,
    rol_id: uuid.UUID,
    rol_in: RolUpdate,
) -> Any:
    """
    Actualizar un rol.
    Solo accesible para superusuarios.
    """
    db_rol = crud.get_rol_by_id(session=session, rol_id=rol_id)
    if not db_rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )

    # Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
    if rol_in.nombre:
        existing_rol = crud.get_rol_by_name(session=session, name=rol_in.nombre)
        if existing_rol and existing_rol.id != rol_id:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro rol con este nombre.",
            )

    rol = crud.update_rol(session=session, db_rol=db_rol, rol_in=rol_in)
    return rol


@router.delete(
    "/{rol_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_rol(rol_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Eliminar un rol.
    Solo accesible para superusuarios.
    """
    deleted = crud.delete_rol(session=session, rol_id=rol_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="El rol con este ID no existe en el sistema.",
        )
    return Message(message="Rol eliminado exitosamente")


@router.get("/name/{rol_name}", response_model=RolPublic)
def read_rol_by_name(
    rol_name: str, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Obtener un rol específico por nombre.
    Accesible para usuarios autenticados.
    """
    rol = crud.get_rol_by_name(session=session, name=rol_name)
    if not rol:
        raise HTTPException(
            status_code=404,
            detail="El rol con este nombre no existe en el sistema.",
        )
    return rol
