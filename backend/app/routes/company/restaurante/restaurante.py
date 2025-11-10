import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.company.restaurante import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.company.restaurante import (
    Restaurante,
    RestauranteCreate,
    RestaurantePublic,
    RestaurantesPublic,
    RestauranteUpdate,
)
from models.company.empresa import Empresa
from models.config import Message

router = APIRouter(prefix="/restaurantes", tags=["restaurantes"])


@router.get(
    "/",
    response_model=RestaurantesPublic,
)
def read_restaurantes(
    session: SessionDep, 
    current_user: CurrentUser,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener restaurantes.
    - Superusuarios: ven todos los restaurantes
    - Usuarios normales: solo ven restaurantes de su empresa
    """
    if current_user.is_superuser:
        # Superadmin sees all
        count_statement = select(func.count()).select_from(Restaurante)
        count = session.exec(count_statement).one()
        statement = select(Restaurante).offset(skip).limit(limit)
        restaurantes = session.exec(statement).all()
    else:
        # Normal user sees only restaurantes from their empresa
        if not current_user.empresa_id:
            return RestaurantesPublic(data=[], count=0)
        
        statement = select(Restaurante).where(Restaurante.empresa_id == current_user.empresa_id)
        restaurantes = session.exec(statement).all()
        count = len(restaurantes)
    
    restaurantes_public = [RestaurantePublic.model_validate(rest) for rest in restaurantes]
    return RestaurantesPublic(data=restaurantes_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=RestaurantePublic,
)
def create_restaurante(*, session: SessionDep, restaurante_in: RestauranteCreate) -> Any:
    """
    Crear un nuevo restaurante.
    Solo accesible para superusuarios.
    """
    # Verificar que la empresa existe
    empresa = session.get(Empresa, restaurante_in.empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="La empresa con este ID no existe en el sistema.",
        )

    restaurante = crud.create_restaurante(session=session, restaurante_create=restaurante_in)
    return restaurante


@router.get(
    "/{restaurante_id}",
    response_model=RestaurantePublic,
)
def read_restaurante_by_id(
    restaurante_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Obtener un restaurante por su ID.
    """
    restaurante = crud.get_restaurante_by_id(session=session, restaurante_id=restaurante_id)
    if not restaurante:
        raise HTTPException(
            status_code=404,
            detail="El restaurante con este ID no existe en el sistema.",
        )
    
    # Si el usuario no es superusuario, verificar que el restaurante pertenezca a su empresa
    if not current_user.is_superuser:
        if current_user.empresa_id != restaurante.empresa_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para acceder a este restaurante.",
            )
    
    return restaurante


@router.get(
    "/empresa/{empresa_id}",
    response_model=RestaurantesPublic,
)
def read_restaurantes_by_empresa(
    empresa_id: uuid.UUID, 
    session: SessionDep, 
    current_user: CurrentUser,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener todos los restaurantes de una empresa específica.
    - Superusuarios: pueden ver restaurantes de cualquier empresa
    - Usuarios normales: solo pueden ver restaurantes de su propia empresa
    """
    # Check permissions
    if not current_user.is_superuser and current_user.empresa_id != empresa_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver los restaurantes de esta empresa.",
        )
    
    # Verificar que la empresa existe
    empresa = session.get(Empresa, empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="La empresa con este ID no existe en el sistema.",
        )

    restaurantes = crud.get_restaurantes_by_empresa(
        session=session, empresa_id=empresa_id, skip=skip, limit=limit
    )
    
    # Contar total de restaurantes de la empresa
    count_statement = select(func.count()).select_from(Restaurante).where(Restaurante.empresa_id == empresa_id)
    count = session.exec(count_statement).one()
    
    restaurantes_public = [RestaurantePublic.model_validate(rest) for rest in restaurantes]
    return RestaurantesPublic(data=restaurantes_public, count=count)


@router.patch(
    "/{restaurante_id}",
    response_model=RestaurantePublic,
)
def update_restaurante(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    restaurante_id: uuid.UUID,
    restaurante_in: RestauranteUpdate,
) -> Any:
    """
    Actualizar un restaurante.
    - Superusuarios: pueden actualizar cualquier restaurante
    - Usuarios normales: solo pueden actualizar restaurantes de su empresa
    """
    restaurante = crud.get_restaurante_by_id(session=session, restaurante_id=restaurante_id)
    if not restaurante:
        raise HTTPException(
            status_code=404,
            detail="El restaurante con este ID no existe en el sistema.",
        )
    
    # Check permissions
    if not current_user.is_superuser and current_user.empresa_id != restaurante.empresa_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar este restaurante.",
        )

    # Si se está actualizando la empresa, verificar que existe
    if restaurante_in.empresa_id and restaurante_in.empresa_id != restaurante.empresa_id:
        empresa = session.get(Empresa, restaurante_in.empresa_id)
        if not empresa:
            raise HTTPException(
                status_code=404,
                detail="La empresa con este ID no existe en el sistema.",
            )

    restaurante = crud.update_restaurante(
        session=session, db_restaurante=restaurante, restaurante_in=restaurante_in
    )
    return restaurante


@router.delete(
    "/{restaurante_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_restaurante(restaurante_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Eliminar un restaurante.
    Solo accesible para superusuarios.
    """
    restaurante = crud.get_restaurante_by_id(session=session, restaurante_id=restaurante_id)
    if not restaurante:
        raise HTTPException(
            status_code=404,
            detail="El restaurante con este ID no existe en el sistema.",
        )

    # Verificar si hay mesas asociadas a este restaurante
    from models.company.mesarestaurante import MesaRestaurante
    statement = select(MesaRestaurante).where(MesaRestaurante.restaurante_id == restaurante_id)
    mesas = session.exec(statement).all()
    if mesas:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar el restaurante. Tiene {len(mesas)} mesa(s) asociada(s).",
        )

    # Verificar si hay usuarios asociados a este restaurante
    from models.auth.users import User
    statement = select(User).where(User.restaurante_id == restaurante_id)
    usuarios = session.exec(statement).all()
    if usuarios:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar el restaurante. Tiene {len(usuarios)} usuario(s) asociado(s).",
        )

    crud.delete_restaurante(session=session, restaurante_id=restaurante_id)
    return Message(message="Restaurante eliminado exitosamente")
