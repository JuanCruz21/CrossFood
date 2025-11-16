import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.product.ordenitem import crud
from app.routes.deps import SessionDep, require_permissions
from app.routes.auth.permisos.permissions import ORDER_READ, ORDER_WRITE, ORDER_DELETE
from models.product.ordenitem import (
    OrdenItem,
    OrdenItemCreate,
    OrdenItemPublic,
    OrdenItemsPublic,
    OrdenItemUpdate,
)
from models.config import Message

router = APIRouter(prefix="/orden-items", tags=["orden-items"])


@router.get(
    "/orden/{orden_id}",
    dependencies=[Depends(require_permissions(ORDER_READ))],
    response_model=OrdenItemsPublic,
)
def read_orden_items_by_orden(
    orden_id: uuid.UUID,
    session: SessionDep
) -> Any:
    """
    Obtener todos los items de una orden específica.
    Requiere permiso: ORDER_READ
    """
    items = crud.get_orden_items_by_orden(session=session, orden_id=orden_id)
    count = len(items)
    items_public = [OrdenItemPublic.model_validate(item) for item in items]
    
    return OrdenItemsPublic(data=items_public, count=count)


@router.get(
    "/producto/{producto_id}",
    dependencies=[Depends(require_permissions(ORDER_READ))],
    response_model=OrdenItemsPublic,
)
def read_orden_items_by_producto(
    producto_id: uuid.UUID,
    session: SessionDep, 
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener todos los items de orden que incluyen un producto específico.
    Requiere permiso: ORDER_READ
    """
    items = crud.get_orden_items_by_producto(
        session=session, 
        producto_id=producto_id,
        skip=skip,
        limit=limit
    )
    count_statement = select(func.count()).select_from(OrdenItem).where(
        OrdenItem.producto_id == producto_id
    )
    count = session.exec(count_statement).one()
    items_public = [OrdenItemPublic.model_validate(item) for item in items]
    
    return OrdenItemsPublic(data=items_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(ORDER_WRITE))],
    response_model=OrdenItemPublic,
)
def create_orden_item(
    *, 
    session: SessionDep, 
    orden_item_in: OrdenItemCreate
) -> Any:
    """
    Crear un nuevo item de orden (agregar un producto a una orden).
    Requiere permiso: ORDER_WRITE
    """
    # Verificar que la orden existe
    from app.routes.product.orden import crud as orden_crud
    orden = orden_crud.get_orden_by_id(session=session, orden_id=orden_item_in.orden_id)
    if not orden:
        raise HTTPException(
            status_code=404,
            detail="La orden especificada no existe.",
        )
    
    # Verificar que el producto existe
    from app.routes.product.producto import crud as producto_crud
    producto = producto_crud.get_producto_by_id(session=session, producto_id=orden_item_in.producto_id)
    if not producto:
        raise HTTPException(
            status_code=404,
            detail="El producto especificado no existe.",
        )
    
    # Verificar que hay stock suficiente
    if producto.stock < orden_item_in.cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Disponible: {producto.stock}, solicitado: {orden_item_in.cantidad}",
        )
    
    # Crear el item
    orden_item = crud.create_orden_item(session=session, orden_item_create=orden_item_in)
    
    # Actualizar el stock del producto
    producto_crud.update_stock(session=session, producto_id=orden_item_in.producto_id, cantidad=-orden_item_in.cantidad)
    
    return orden_item


@router.get(
    "/{orden_item_id}",
    dependencies=[Depends(require_permissions(ORDER_READ))],
    response_model=OrdenItemPublic,
)
def read_orden_item_by_id(
    orden_item_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Obtener un item de orden por su ID.
    Requiere permiso: ORDER_READ
    """
    orden_item = crud.get_orden_item_by_id(session=session, orden_item_id=orden_item_id)
    if not orden_item:
        raise HTTPException(
            status_code=404,
            detail="El item de orden con este ID no existe.",
        )
    
    return orden_item


@router.patch(
    "/{orden_item_id}",
    dependencies=[Depends(require_permissions(ORDER_WRITE))],
    response_model=OrdenItemPublic,
)
def update_orden_item(
    *,
    session: SessionDep,
    orden_item_id: uuid.UUID,
    orden_item_in: OrdenItemUpdate,
) -> Any:
    """
    Actualizar un item de orden.
    Si se actualiza la cantidad, ajusta el stock del producto automáticamente.
    Requiere permiso: ORDER_WRITE
    """
    orden_item = crud.get_orden_item_by_id(session=session, orden_item_id=orden_item_id)
    if not orden_item:
        raise HTTPException(
            status_code=404,
            detail="El item de orden con este ID no existe.",
        )
    
    # Si se actualiza la cantidad, ajustar el stock
    if orden_item_in.cantidad is not None and orden_item_in.cantidad != orden_item.cantidad:
        from app.routes.product.producto import crud as producto_crud
        
        diferencia = orden_item_in.cantidad - orden_item.cantidad
        producto = producto_crud.get_producto_by_id(session=session, producto_id=orden_item.producto_id)
        
        if not producto:
            raise HTTPException(
                status_code=404,
                detail="El producto asociado no existe.",
            )
        
        # Verificar que hay stock suficiente si se aumenta la cantidad
        if diferencia > 0 and producto.stock < diferencia:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Disponible: {producto.stock}, adicional requerido: {diferencia}",
            )
        
        # Actualizar stock (negativo si aumenta la cantidad, positivo si disminuye)
        producto_crud.update_stock(session=session, producto_id=orden_item.producto_id, cantidad=-diferencia)

    orden_item = crud.update_orden_item(session=session, db_orden_item=orden_item, orden_item_in=orden_item_in)
    return orden_item


@router.patch(
    "/{orden_item_id}/cantidad",
    dependencies=[Depends(require_permissions(ORDER_WRITE))],
    response_model=OrdenItemPublic,
)
def update_orden_item_cantidad(
    *,
    session: SessionDep,
    orden_item_id: uuid.UUID,
    nueva_cantidad: int,
) -> Any:
    """
    Actualizar solo la cantidad de un item de orden.
    Ajusta el stock del producto automáticamente.
    Requiere permiso: ORDER_WRITE
    """
    if nueva_cantidad <= 0:
        raise HTTPException(
            status_code=400,
            detail="La cantidad debe ser mayor a 0.",
        )
    
    orden_item = crud.get_orden_item_by_id(session=session, orden_item_id=orden_item_id)
    if not orden_item:
        raise HTTPException(
            status_code=404,
            detail="El item de orden con este ID no existe.",
        )
    
    from app.routes.product.producto import crud as producto_crud
    
    diferencia = nueva_cantidad - orden_item.cantidad
    producto = producto_crud.get_producto_by_id(session=session, producto_id=orden_item.producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=404,
            detail="El producto asociado no existe.",
        )
    
    # Verificar que hay stock suficiente si se aumenta la cantidad
    if diferencia > 0 and producto.stock < diferencia:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Disponible: {producto.stock}, adicional requerido: {diferencia}",
        )
    
    # Actualizar stock
    producto_crud.update_stock(session=session, producto_id=orden_item.producto_id, cantidad=-diferencia)
    
    # Actualizar cantidad
    orden_item = crud.update_cantidad_item(session=session, orden_item_id=orden_item_id, nueva_cantidad=nueva_cantidad)
    return orden_item


@router.delete(
    "/{orden_item_id}",
    dependencies=[Depends(require_permissions(ORDER_DELETE))],
    response_model=Message,
)
def delete_orden_item(
    orden_item_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Eliminar un item de orden.
    Restaura el stock del producto automáticamente.
    Requiere permiso: ORDER_DELETE
    """
    orden_item = crud.get_orden_item_by_id(session=session, orden_item_id=orden_item_id)
    if not orden_item:
        raise HTTPException(
            status_code=404,
            detail="El item de orden con este ID no existe.",
        )
    
    # Restaurar stock
    from app.routes.product.producto import crud as producto_crud
    producto_crud.update_stock(session=session, producto_id=orden_item.producto_id, cantidad=orden_item.cantidad)
    
    # Eliminar item
    success = crud.delete_orden_item(session=session, orden_item_id=orden_item_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="El item de orden con este ID no existe.",
        )
    
    return Message(message="Item de orden eliminado exitosamente")


@router.delete(
    "/orden/{orden_id}",
    dependencies=[Depends(require_permissions(ORDER_DELETE))],
    response_model=Message,
)
def delete_orden_items_by_orden(
    orden_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Eliminar todos los items de una orden.
    Restaura el stock de todos los productos automáticamente.
    Requiere permiso: ORDER_DELETE
    """
    # Obtener todos los items de la orden
    items = crud.get_orden_items_by_orden(session=session, orden_id=orden_id)
    
    if not items:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron items para esta orden.",
        )
    
    # Restaurar stock de cada producto
    from app.routes.product.producto import crud as producto_crud
    for item in items:
        producto_crud.update_stock(session=session, producto_id=item.producto_id, cantidad=item.cantidad)
    
    # Eliminar todos los items
    count = crud.delete_orden_items_by_orden(session=session, orden_id=orden_id)
    
    return Message(message=f"{count} items de orden eliminados exitosamente")
