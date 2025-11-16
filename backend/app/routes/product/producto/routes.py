import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.product.producto import crud
from app.routes.deps import SessionDep, require_permissions
from app.routes.auth.permisos.permissions import PRODUCT_READ, PRODUCT_WRITE, PRODUCT_DELETE
from models.product.producto import (
    Producto,
    ProductoCreate,
    ProductoPublic,
    ProductosPublic,
    ProductoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(PRODUCT_READ))],
    response_model=ProductosPublic,
)
def read_productos(
    session: SessionDep, 
    restaurante_id: uuid.UUID | None = None,
    categoria_id: uuid.UUID | None = None,
    empresa_id: uuid.UUID | None = None,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener productos con paginación.
    Permite filtrar por:
    - restaurante_id: productos de un restaurante específico
    - categoria_id: productos de una categoría específica
    - empresa_id: productos de una empresa específica
    Si no se proporciona ningún filtro, devuelve todos los productos.
    Requiere permiso: PRODUCT_READ
    """
    if restaurante_id:
        productos = crud.get_productos_by_restaurante(
            session=session, 
            restaurante_id=restaurante_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Producto).where(
            Producto.restaurante_id == restaurante_id
        )
    elif categoria_id:
        productos = crud.get_productos_by_categoria(
            session=session, 
            categoria_id=categoria_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Producto).where(
            Producto.categoria_id == categoria_id
        )
    elif empresa_id:
        productos = crud.get_productos_by_empresa(
            session=session, 
            empresa_id=empresa_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Producto).where(
            Producto.empresa_id == empresa_id
        )
    else:
        productos = crud.get_all_productos(session=session, skip=skip, limit=limit)
        count_statement = select(func.count()).select_from(Producto)
    
    count = session.exec(count_statement).one()
    productos_public = [ProductoPublic.model_validate(producto) for producto in productos]
    
    return ProductosPublic(data=productos_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(PRODUCT_WRITE))],
    response_model=ProductoPublic,
)
def create_producto(
    *, 
    session: SessionDep, 
    producto_in: ProductoCreate
) -> Any:
    """
    Crear un nuevo producto.
    Verifica que no exista un producto con el mismo nombre.
    Requiere permiso: PRODUCT_WRITE
    """
    # Verificar que no exista un producto con el mismo nombre
    producto = crud.get_producto_by_nombre(session=session, nombre=producto_in.nombre)
    if producto:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un producto con este nombre.",
        )

    producto = crud.create_producto(session=session, producto_create=producto_in)
    return producto


@router.get(
    "/{producto_id}",
    dependencies=[Depends(require_permissions(PRODUCT_READ))],
    response_model=ProductoPublic,
)
def read_producto_by_id(
    producto_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Obtener un producto por su ID.
    Requiere permiso: PRODUCT_READ
    """
    producto = crud.get_producto_by_id(session=session, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=404,
            detail="El producto con este ID no existe.",
        )
    
    return producto


@router.patch(
    "/{producto_id}",
    dependencies=[Depends(require_permissions(PRODUCT_WRITE))],
    response_model=ProductoPublic,
)
def update_producto(
    *,
    session: SessionDep,
    producto_id: uuid.UUID,
    producto_in: ProductoUpdate,
) -> Any:
    """
    Actualizar un producto.
    Requiere permiso: PRODUCT_WRITE
    """
    producto = crud.get_producto_by_id(session=session, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=404,
            detail="El producto con este ID no existe.",
        )

    # Si se está actualizando el nombre, verificar que no exista otro producto con ese nombre
    if producto_in.nombre and producto_in.nombre != producto.nombre:
        existing_producto = crud.get_producto_by_nombre(session=session, nombre=producto_in.nombre)
        if existing_producto:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro producto con este nombre.",
            )

    producto = crud.update_producto(session=session, db_producto=producto, producto_in=producto_in)
    return producto


@router.patch(
    "/{producto_id}/stock",
    dependencies=[Depends(require_permissions(PRODUCT_WRITE))],
    response_model=ProductoPublic,
)
def update_producto_stock(
    *,
    session: SessionDep,
    producto_id: uuid.UUID,
    cantidad: int,
) -> Any:
    """
    Actualizar el stock de un producto.
    La cantidad puede ser positiva (agregar stock) o negativa (reducir stock).
    Requiere permiso: PRODUCT_WRITE
    """
    producto = crud.update_stock(session=session, producto_id=producto_id, cantidad=cantidad)
    if not producto:
        raise HTTPException(
            status_code=404,
            detail="El producto con este ID no existe.",
        )
    
    if producto.stock < 0:
        raise HTTPException(
            status_code=400,
            detail="El stock no puede ser negativo.",
        )
    
    return producto


@router.delete(
    "/{producto_id}",
    dependencies=[Depends(require_permissions(PRODUCT_DELETE))],
    response_model=Message,
)
def delete_producto(
    producto_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Eliminar un producto.
    Requiere permiso: PRODUCT_DELETE
    """
    success = crud.delete_producto(session=session, producto_id=producto_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="El producto con este ID no existe.",
        )
    
    return Message(message="Producto eliminado exitosamente")
