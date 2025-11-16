import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.product.tasaimpositiva import crud
from app.routes.deps import CurrentUser, SessionDep, require_permissions
from app.routes.auth.permisos.permissions import PRODUCT_READ, PRODUCT_WRITE, PRODUCT_DELETE
from models.product.tasaimpositiva import (
    TasaImpositiva,
    TasaImpositivaCreate,
    TasaImpositivaPublic,
    TasasImpositivasPublic,
    TasaImpositivaUpdate,
)
from models.config import Message

router = APIRouter(prefix="/tasas-impositivas", tags=["tasas-impositivas"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(PRODUCT_READ))],
    response_model=TasasImpositivasPublic,
)
def read_tasas_impositivas(
    session: SessionDep, 
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener todas las tasas impositivas con paginación.
    Requiere permiso: PRODUCT_READ
    """
    count_statement = select(func.count()).select_from(TasaImpositiva)
    count = session.exec(count_statement).one()
    
    tasas = crud.get_all_tasas_impositivas(session=session, skip=skip, limit=limit)
    tasas_public = [TasaImpositivaPublic.model_validate(tasa) for tasa in tasas]
    
    return TasasImpositivasPublic(data=tasas_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(PRODUCT_WRITE))],
    response_model=TasaImpositivaPublic,
)
def create_tasa_impositiva(*, session: SessionDep, tasa_in: TasaImpositivaCreate) -> Any:
    """
    Crear una nueva tasa impositiva.
    Solo accesible para superusuarios.
    """
    # Verificar que no exista una tasa con el mismo nombre
    tasa = crud.get_tasa_impositiva_by_nombre(session=session, nombre=tasa_in.nombre)
    if tasa:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una tasa impositiva con este nombre.",
        )

    tasa = crud.create_tasa_impositiva(session=session, tasa_create=tasa_in)
    return tasa


@router.get(
    "/{tasa_id}",
    dependencies=[Depends(require_permissions(PRODUCT_READ))],
    response_model=TasaImpositivaPublic,
)
def read_tasa_impositiva_by_id(
    tasa_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Obtener una tasa impositiva por su ID.
    Requiere permiso: PRODUCT_READ
    """
    tasa = crud.get_tasa_impositiva_by_id(session=session, tasa_id=tasa_id)
    if not tasa:
        raise HTTPException(
            status_code=404,
            detail="La tasa impositiva con este ID no existe.",
        )
    
    return tasa


@router.patch(
    "/{tasa_id}",
    dependencies=[Depends(require_permissions(PRODUCT_WRITE))],
    response_model=TasaImpositivaPublic,
)
def update_tasa_impositiva(
    *,
    session: SessionDep,
    tasa_id: uuid.UUID,
    tasa_in: TasaImpositivaUpdate,
) -> Any:
    """
    Actualizar una tasa impositiva.
    Requiere permiso: PRODUCT_WRITE
    """
    tasa = crud.get_tasa_impositiva_by_id(session=session, tasa_id=tasa_id)
    if not tasa:
        raise HTTPException(
            status_code=404,
            detail="La tasa impositiva con este ID no existe.",
        )

    # Si se está actualizando el nombre, verificar que no exista otra tasa con ese nombre
    if tasa_in.nombre and tasa_in.nombre != tasa.nombre:
        existing_tasa = crud.get_tasa_impositiva_by_nombre(session=session, nombre=tasa_in.nombre)
        if existing_tasa:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otra tasa impositiva con este nombre.",
            )

    tasa = crud.update_tasa_impositiva(session=session, db_tasa=tasa, tasa_in=tasa_in)
    return tasa


@router.delete(
    "/{tasa_id}",
    dependencies=[Depends(require_permissions(PRODUCT_DELETE))],
    response_model=Message,
)
def delete_tasa_impositiva(
    tasa_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Eliminar una tasa impositiva.
    Requiere permiso: PRODUCT_DELETE
    """
    success = crud.delete_tasa_impositiva(session=session, tasa_id=tasa_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="La tasa impositiva con este ID no existe.",
        )
    
    return Message(message="Tasa impositiva eliminada exitosamente")
