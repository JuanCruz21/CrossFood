import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.company.mesarestaurante import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.company.mesarestaurante import (
    MesaRestaurante,
    MesaRestauranteCreate,
    MesaRestaurantePublic,
    MesaRestaurantesPublic,
    MesaRestauranteUpdate,
)
from models.company.restaurante import Restaurante
from models.config import Message

router = APIRouter(prefix="/mesas", tags=["mesas"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=MesaRestaurantesPublic,
)
def read_mesas(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Obtener todas las mesas de restaurante.
    Solo accesible para superusuarios.
    """
    count_statement = select(func.count()).select_from(MesaRestaurante)
    count = session.exec(count_statement).one()

    statement = select(MesaRestaurante).offset(skip).limit(limit)
    mesas = session.exec(statement).all()
    mesas_public = [MesaRestaurantePublic.model_validate(mesa) for mesa in mesas]

    return MesaRestaurantesPublic(data=mesas_public, count=count)


@router.post(
    "/",
    response_model=MesaRestaurantePublic,
)
def create_mesa(
    *, session: SessionDep, mesa_in: MesaRestauranteCreate, current_user: CurrentUser
) -> Any:
    """
    Crear una nueva mesa de restaurante.
    Los usuarios deben tener acceso al restaurante asociado.
    """
    # Verificar que el restaurante existe
    restaurante = session.get(Restaurante, mesa_in.restaurante_id)
    if not restaurante:
        raise HTTPException(
            status_code=404,
            detail="El restaurante con este ID no existe en el sistema.",
        )

    # Verificar permisos: superusuarios o usuarios del mismo restaurante
    if not current_user.is_superuser:
        if current_user.restaurante_id != mesa_in.restaurante_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para crear mesas en este restaurante.",
            )

    # Verificar que no exista una mesa con el mismo número en el restaurante
    existing_mesa = crud.get_mesa_by_numero(
        session=session, restaurante_id=mesa_in.restaurante_id, numero_mesa=mesa_in.numero_mesa
    )
    if existing_mesa:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe una mesa con el número {mesa_in.numero_mesa} en este restaurante.",
        )

    mesa = crud.create_mesa(session=session, mesa_create=mesa_in)
    return mesa


@router.get(
    "/{mesa_id}",
    response_model=MesaRestaurantePublic,
)
def read_mesa_by_id(
    mesa_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Obtener una mesa por su ID.
    """
    mesa = crud.get_mesa_by_id(session=session, mesa_id=mesa_id)
    if not mesa:
        raise HTTPException(
            status_code=404,
            detail="La mesa con este ID no existe en el sistema.",
        )

    # Verificar permisos: superusuarios o usuarios del mismo restaurante
    if not current_user.is_superuser:
        if current_user.restaurante_id != mesa.restaurante_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para acceder a esta mesa.",
            )

    return mesa


@router.get(
    "/restaurante/{restaurante_id}",
    response_model=MesaRestaurantesPublic,
)
def read_mesas_by_restaurante(
    restaurante_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Obtener todas las mesas de un restaurante específico.
    Los usuarios deben tener acceso al restaurante asociado.
    """
    # Verificar que el restaurante existe
    restaurante = session.get(Restaurante, restaurante_id)
    if not restaurante:
        raise HTTPException(
            status_code=404,
            detail="El restaurante con este ID no existe en el sistema.",
        )

    # Verificar permisos: superusuarios o usuarios del mismo restaurante
    if not current_user.is_superuser:
        if current_user.restaurante_id != restaurante_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para ver las mesas de este restaurante.",
            )

    mesas = crud.get_mesas_by_restaurante(
        session=session, restaurante_id=restaurante_id, skip=skip, limit=limit
    )

    # Contar total de mesas del restaurante
    count_statement = select(func.count()).select_from(MesaRestaurante).where(
        MesaRestaurante.restaurante_id == restaurante_id
    )
    count = session.exec(count_statement).one()

    mesas_public = [MesaRestaurantePublic.model_validate(mesa) for mesa in mesas]
    return MesaRestaurantesPublic(data=mesas_public, count=count)


@router.patch(
    "/{mesa_id}",
    response_model=MesaRestaurantePublic,
)
def update_mesa(
    *,
    session: SessionDep,
    mesa_id: uuid.UUID,
    mesa_in: MesaRestauranteUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    Actualizar una mesa de restaurante.
    Los usuarios deben tener acceso al restaurante asociado.
    """
    mesa = crud.get_mesa_by_id(session=session, mesa_id=mesa_id)
    if not mesa:
        raise HTTPException(
            status_code=404,
            detail="La mesa con este ID no existe en el sistema.",
        )

    # Verificar permisos: superusuarios o usuarios del mismo restaurante
    if not current_user.is_superuser:
        if current_user.restaurante_id != mesa.restaurante_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para actualizar esta mesa.",
            )

    # Si se está actualizando el restaurante, verificar que existe y que el usuario tiene acceso
    if mesa_in.restaurante_id and mesa_in.restaurante_id != mesa.restaurante_id:
        restaurante = session.get(Restaurante, mesa_in.restaurante_id)
        if not restaurante:
            raise HTTPException(
                status_code=404,
                detail="El restaurante con este ID no existe en el sistema.",
            )

        # Verificar permisos en el nuevo restaurante
        if not current_user.is_superuser:
            if current_user.restaurante_id != mesa_in.restaurante_id:
                raise HTTPException(
                    status_code=403,
                    detail="No tienes permisos para mover esta mesa a otro restaurante.",
                )

    # Si se está actualizando el número de mesa, verificar que no exista otra con el mismo número
    if mesa_in.numero_mesa and mesa_in.numero_mesa != mesa.numero_mesa:
        target_restaurante_id = mesa_in.restaurante_id if mesa_in.restaurante_id else mesa.restaurante_id
        existing_mesa = crud.get_mesa_by_numero(
            session=session, restaurante_id=target_restaurante_id, numero_mesa=mesa_in.numero_mesa
        )
        if existing_mesa:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe una mesa con el número {mesa_in.numero_mesa} en este restaurante.",
            )

    mesa = crud.update_mesa(session=session, db_mesa=mesa, mesa_in=mesa_in)
    return mesa


@router.delete(
    "/{mesa_id}",
    response_model=Message,
)
def delete_mesa(
    mesa_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Eliminar una mesa de restaurante.
    Los usuarios deben tener acceso al restaurante asociado.
    """
    mesa = crud.get_mesa_by_id(session=session, mesa_id=mesa_id)
    if not mesa:
        raise HTTPException(
            status_code=404,
            detail="La mesa con este ID no existe en el sistema.",
        )

    # Verificar permisos: superusuarios o usuarios del mismo restaurante
    if not current_user.is_superuser:
        if current_user.restaurante_id != mesa.restaurante_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para eliminar esta mesa.",
            )

    crud.delete_mesa(session=session, mesa_id=mesa_id)
    return Message(message="Mesa eliminada exitosamente")
