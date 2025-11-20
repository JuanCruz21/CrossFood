import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.product.orden import crud
from app.routes.deps import SessionDep, require_permissions
from app.routes.auth.permisos.permissions import ORDER_READ, ORDER_WRITE, ORDER_DELETE
from models.product.orden import (
    Orden,
    OrdenCreate,
    OrdenPublic,
    OrdenesPublic,
    OrdenUpdate,
    OrdenEstadoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/ordenes", tags=["ordenes"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(ORDER_READ))],
    response_model=OrdenesPublic,
)
def read_ordenes(
    session: SessionDep, 
    restaurante_id: uuid.UUID | None = None,
    cliente_id: uuid.UUID | None = None,
    mesa_id: uuid.UUID | None = None,
    estado: str | None = None,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener órdenes con paginación.
    Permite filtrar por:
    - restaurante_id: órdenes de un restaurante específico
    - cliente_id: órdenes de un cliente específico
    - mesa_id: órdenes de una mesa específica
    - estado: órdenes con un estado específico (pendiente, en_proceso, completada, cancelada)
    Si no se proporciona ningún filtro, devuelve todas las órdenes.
    Requiere permiso: ORDER_READ
    """
    if estado:
        ordenes = crud.get_ordenes_by_estado(
            session=session, 
            estado=estado,
            restaurante_id=restaurante_id,
            skip=skip, 
            limit=limit
        )
        if restaurante_id:
            count_statement = select(func.count()).select_from(Orden).where(
                Orden.estado == estado,
                Orden.restaurante_id == restaurante_id
            )
        else:
            count_statement = select(func.count()).select_from(Orden).where(
                Orden.estado == estado
            )
    elif restaurante_id:
        ordenes = crud.get_ordenes_by_restaurante(
            session=session, 
            restaurante_id=restaurante_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Orden).where(
            Orden.restaurante_id == restaurante_id
        )
    elif cliente_id:
        ordenes = crud.get_ordenes_by_cliente(
            session=session, 
            cliente_id=cliente_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Orden).where(
            Orden.cliente_id == cliente_id
        )
    elif mesa_id:
        ordenes = crud.get_ordenes_by_mesa(
            session=session, 
            mesa_id=mesa_id, 
            skip=skip, 
            limit=limit
        )
        count_statement = select(func.count()).select_from(Orden).where(
            Orden.mesa_id == mesa_id
        )
    else:
        ordenes = crud.get_all_ordenes(session=session, skip=skip, limit=limit)
        count_statement = select(func.count()).select_from(Orden)
    
    count = session.exec(count_statement).one()
    ordenes_public = [OrdenPublic.model_validate(orden) for orden in ordenes]
    
    return OrdenesPublic(data=ordenes_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(ORDER_WRITE))],
    response_model=OrdenPublic,
)
def create_orden(
    *, 
    session: SessionDep, 
    orden_in: OrdenCreate
) -> Any:
    """
    Crear una nueva orden.
    Requiere permiso: ORDER_WRITE
    """
    orden = crud.create_orden(session=session, orden_create=orden_in)
    return orden


@router.get(
    "/{orden_id}",
    dependencies=[Depends(require_permissions(ORDER_READ))],
    response_model=OrdenPublic,
)
def read_orden_by_id(
    orden_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Obtener una orden por su ID.
    Requiere permiso: ORDER_READ
    """
    orden = crud.get_orden_by_id(session=session, orden_id=orden_id)
    if not orden:
        raise HTTPException(
            status_code=404,
            detail="La orden con este ID no existe.",
        )
    
    return orden


@router.patch(
    "/{orden_id}",
    dependencies=[Depends(require_permissions(ORDER_WRITE))],
    response_model=OrdenPublic,
)
def update_orden(
    *,
    session: SessionDep,
    orden_id: uuid.UUID,
    orden_in: OrdenUpdate,
) -> Any:
    """
    Actualizar una orden.
    Requiere permiso: ORDER_WRITE
    """
    orden = crud.get_orden_by_id(session=session, orden_id=orden_id)
    if not orden:
        raise HTTPException(
            status_code=404,
            detail="La orden con este ID no existe.",
        )

    orden = crud.update_orden(session=session, db_orden=orden, orden_in=orden_in)
    return orden


@router.patch(
    "/{orden_id}/estado",
    dependencies=[Depends(require_permissions(ORDER_WRITE))],
    response_model=OrdenPublic,
)
def update_orden_estado(
    *,
    session: SessionDep,
    orden_id: uuid.UUID,
    estado_update: OrdenEstadoUpdate,
) -> Any:
    """
    Actualizar el estado de una orden.
    Estados válidos: pendiente, en_proceso, completada, cancelada
    Requiere permiso: ORDER_WRITE
    """
    estados_validos = ["pendiente", "en_proceso", "completada", "cancelada"]
    if estado_update.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Los estados válidos son: {', '.join(estados_validos)}",
        )
    
    orden = crud.update_estado_orden(session=session, orden_id=orden_id, nuevo_estado=estado_update.estado)
    if not orden:
        raise HTTPException(
            status_code=404,
            detail="La orden con este ID no existe.",
        )
    
    return orden


@router.get(
    "/{orden_id}/items",
    dependencies=[Depends(require_permissions(ORDER_READ))],
)
def read_orden_items(
    orden_id: uuid.UUID,
    session: SessionDep
) -> Any:
    """
    Obtener todos los items de una orden específica.
    Requiere permiso: ORDER_READ
    """
    from app.routes.product.ordenitem import crud as ordenitem_crud
    
    orden = crud.get_orden_by_id(session=session, orden_id=orden_id)
    if not orden:
        raise HTTPException(
            status_code=404,
            detail="La orden con este ID no existe.",
        )
    
    items = ordenitem_crud.get_orden_items_by_orden(session=session, orden_id=orden_id)
    return {"data": items, "count": len(items)}


@router.get(
    "/activas/restaurante/{restaurante_id}",
    dependencies=[Depends(require_permissions(ORDER_READ))],
)
def read_ordenes_activas(
    restaurante_id: uuid.UUID,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Obtener órdenes activas (pendiente, en_proceso, completada) de un restaurante con sus items.
    Excluye las órdenes canceladas.
    Requiere permiso: ORDER_READ
    """
    from app.routes.product.ordenitem import crud as ordenitem_crud
    from models.product.producto import Producto
    from models.company.mesarestaurante import MesaRestaurante
    
    # Obtener órdenes activas - filtrando manualmente ya que estado es string
    statement = select(Orden).where(
        Orden.restaurante_id == restaurante_id
    ).offset(skip).limit(limit)
    
    todas_ordenes = list(session.exec(statement).all())
    ordenes = [o for o in todas_ordenes if o.estado in ["pendiente", "en_proceso", "completada"]]
    
    # Obtener el conteo total de órdenes activas
    count_statement = select(Orden).where(
        Orden.restaurante_id == restaurante_id
    )
    todas = list(session.exec(count_statement).all())
    count = len([o for o in todas if o.estado in ["pendiente", "en_proceso", "completada"]])
    
    # Enriquecer cada orden con sus items y detalles
    ordenes_detalladas = []
    for orden in ordenes:
        orden_dict = orden.model_dump()
        
        # Obtener items de la orden
        items = ordenitem_crud.get_orden_items_by_orden(session=session, orden_id=orden.id)
        items_detallados = []
        
        for item in items:
            item_dict = item.model_dump()
            # Obtener información del producto
            producto = session.get(Producto, item.producto_id)
            if producto:
                item_dict["producto_nombre"] = producto.nombre
                item_dict["producto_descripcion"] = producto.descripcion
            items_detallados.append(item_dict)
        
        orden_dict["items"] = items_detallados
        orden_dict["total_items"] = len(items_detallados)
        
        # Obtener información de la mesa si existe
        if orden.mesa_id:
            mesa = session.get(MesaRestaurante, orden.mesa_id)
            if mesa:
                orden_dict["mesa_numero"] = mesa.numero_mesa
        
        ordenes_detalladas.append(orden_dict)
    
    return {"data": ordenes_detalladas, "count": count}


@router.delete(
    "/{orden_id}",
    dependencies=[Depends(require_permissions(ORDER_DELETE))],
    response_model=Message,
)
def delete_orden(
    orden_id: uuid.UUID, 
    session: SessionDep
) -> Any:
    """
    Eliminar una orden.
    Requiere permiso: ORDER_DELETE
    """
    success = crud.delete_orden(session=session, orden_id=orden_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="La orden con este ID no existe.",
        )
    
    return Message(message="Orden eliminada exitosamente")
