import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.product.categoria import crud
from app.routes.deps import SessionDep, require_permissions, CurrentUser
from app.routes.auth.permisos.permissions import CATEGORIA_DELETE, CATEGORIA_READ, CATEGORIA_WRITE
from models.product.categoria import (
    Categoria,
    CategoriaCreate,
    CategoriaPublic,
    CategoriasPublic,
    CategoriaUpdate,
)
from models.config import Message

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(CATEGORIA_READ))],
    response_model=CategoriasPublic,
)
def read_categorias(
    session: SessionDep, 
    restaurante_id: uuid.UUID | None = None,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener categorías con paginación.
    - Si se proporciona restaurante_id, filtra por restaurante
    - Si no se proporciona, devuelve todas las categorías
    Requiere permiso: CATEGORIA_READ
    """
    if restaurante_id:
        categorias = crud.get_categorias_by_restaurante(
            session=session, 
            restaurante_id=restaurante_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Categoria).where(
            Categoria.restaurante_id == restaurante_id
        )
        count = session.exec(count_statement).one()
    else:
        categorias = crud.get_all_categorias(session=session, skip=skip, limit=limit)
        count_statement = select(func.count()).select_from(Categoria)
        count = session.exec(count_statement).one()
    
    categorias_public = [CategoriaPublic.model_validate(categoria) for categoria in categorias]
    return CategoriasPublic(data=categorias_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(CATEGORIA_WRITE))],
    response_model=CategoriaPublic,
    status_code=201,
)
def create_categoria(
    *, 
    session: SessionDep, 
    current_user: CurrentUser,
    categoria_in: CategoriaCreate
) -> Any:
    """
    Crear una nueva categoría.
    Verifica que no exista una categoría con el mismo nombre en el restaurante.
    Requiere permiso: CATEGORIA_WRITE
    """
    # Verificar que no exista una categoría con el mismo nombre en el restaurante
    categoria = crud.get_categoria_by_nombre(
        session=session, 
        nombre=categoria_in.nombre,
        restaurante_id=current_user.restaurante_id
    )
    if categoria:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una categoría con este nombre en el restaurante.",
        )

    categoria = crud.create_categoria(session=session, categoria_create=categoria_in)
    return categoria


@router.get(
    "/{categoria_id}",
    dependencies=[Depends(require_permissions(CATEGORIA_READ))],
    response_model=CategoriaPublic,
)
def read_categoria_by_id(
    categoria_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Obtener una categoría por su ID.
    Requiere permiso: CATEGORIA_READ
    """
    categoria = crud.get_categoria_by_id(session=session, categoria_id=categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=404,
            detail="La categoría con este ID no existe.",
        )
    
    return categoria


@router.patch(
    "/{categoria_id}",
    dependencies=[Depends(require_permissions(CATEGORIA_WRITE))],
    response_model=CategoriaPublic,
)
def update_categoria(
    *,
    session: SessionDep,
    categoria_id: uuid.UUID,
    categoria_in: CategoriaUpdate,
) -> Any:
    """
    Actualizar una categoría.
    Requiere permiso: CATEGORIA_WRITE
    """
    categoria = crud.get_categoria_by_id(session=session, categoria_id=categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=404,
            detail="La categoría con este ID no existe.",
        )

    # Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
    if categoria_in.nombre and categoria_in.nombre != categoria.nombre:
        existing_categoria = crud.get_categoria_by_nombre(
            session=session, 
            nombre=categoria_in.nombre,
            restaurante_id=categoria.restaurante_id
        )
        if existing_categoria:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otra categoría con este nombre en el restaurante.",
            )

    categoria = crud.update_categoria(session=session, db_categoria=categoria, categoria_in=categoria_in)
    return categoria


@router.delete(
    "/{categoria_id}",
    dependencies=[Depends(require_permissions(CATEGORIA_DELETE))],
    response_model=Message,
)
def delete_categoria(
    categoria_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Eliminar una categoría.
    Requiere permiso: CATEGORIA_DELETE
    """
    success = crud.delete_categoria(session=session, categoria_id=categoria_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="La categoría con este ID no existe.",
        )
    
    return Message(message="Categoría eliminada exitosamente")
