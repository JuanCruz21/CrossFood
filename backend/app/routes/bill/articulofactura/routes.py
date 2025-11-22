import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select

from app.routes.bill.articulofactura import crud
from app.routes.deps import SessionDep, require_permissions
from app.routes.auth.permisos.permissions import BILL_READ, BILL_WRITE, BILL_DELETE
from models.bill.articulofactura import (
    ArticuloFactura,
    ArticuloFacturaCreate,
    ArticuloFacturaPublic,
    ArticulosFacturaPublic,
    ArticuloFacturaUpdate,
)
from models.config import Message

router = APIRouter(prefix="/articulos-factura", tags=["articulos-factura"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=ArticulosFacturaPublic,
)
def read_articulos_factura(
    session: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todos los artículos de factura con paginación.
    Requiere permiso: BILL_READ
    """
    articulos = crud.get_all_articulos_factura(session=session, skip=skip, limit=limit)
    
    count_statement = select(func.count()).select_from(ArticuloFactura)
    count = session.exec(count_statement).one()
    
    return ArticulosFacturaPublic(data=articulos, count=count)


@router.get(
    "/{articulo_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=ArticuloFacturaPublic,
)
def read_articulo_factura(
    *,
    session: SessionDep,
    articulo_id: uuid.UUID,
) -> Any:
    """
    Obtener un artículo de factura específico por ID.
    Requiere permiso: BILL_READ
    """
    articulo = crud.get_articulo_factura_by_id(session=session, articulo_id=articulo_id)
    if not articulo:
        raise HTTPException(
            status_code=404,
            detail="El artículo de factura con este ID no existe.",
        )
    return articulo


@router.get(
    "/factura/{factura_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=ArticulosFacturaPublic,
)
def read_articulos_by_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todos los artículos de una factura específica.
    Requiere permiso: BILL_READ
    """
    articulos = crud.get_articulos_by_factura(
        session=session, factura_id=factura_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(ArticuloFactura).where(
        ArticuloFactura.factura_id == factura_id
    )
    count = session.exec(count_statement).one()
    
    return ArticulosFacturaPublic(data=articulos, count=count)


@router.get(
    "/producto/{producto_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=ArticulosFacturaPublic,
)
def read_articulos_by_producto(
    *,
    session: SessionDep,
    producto_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todos los artículos por producto (historial de ventas).
    Requiere permiso: BILL_READ
    """
    articulos = crud.get_articulos_by_producto(
        session=session, producto_id=producto_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(ArticuloFactura).where(
        ArticuloFactura.producto_id == producto_id
    )
    count = session.exec(count_statement).one()
    
    return ArticulosFacturaPublic(data=articulos, count=count)


@router.get(
    "/factura/{factura_id}/total",
    dependencies=[Depends(require_permissions(BILL_READ))],
)
def read_total_articulos_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
) -> Any:
    """
    Obtener el total de todos los artículos de una factura.
    Requiere permiso: BILL_READ
    """
    total = crud.get_total_articulos_factura(session=session, factura_id=factura_id)
    return {"factura_id": factura_id, "total": total}


@router.post(
    "/",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=ArticuloFacturaPublic,
)
def create_articulo_factura(
    *,
    session: SessionDep,
    articulo_in: ArticuloFacturaCreate,
) -> Any:
    """
    Crear un nuevo artículo de factura.
    Calcula automáticamente subtotal y total, y actualiza los totales de la factura.
    Requiere permiso: BILL_WRITE
    """
    articulo = crud.create_articulo_factura(session=session, articulo_create=articulo_in)
    return articulo


@router.patch(
    "/{articulo_id}",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=ArticuloFacturaPublic,
)
def update_articulo_factura(
    *,
    session: SessionDep,
    articulo_id: uuid.UUID,
    articulo_in: ArticuloFacturaUpdate,
) -> Any:
    """
    Actualizar un artículo de factura existente.
    Recalcula subtotal y total si se modifican cantidad, precio, descuento o impuesto.
    Actualiza los totales de la factura asociada.
    Requiere permiso: BILL_WRITE
    """
    articulo = crud.get_articulo_factura_by_id(session=session, articulo_id=articulo_id)
    if not articulo:
        raise HTTPException(
            status_code=404,
            detail="El artículo de factura con este ID no existe.",
        )
    
    articulo = crud.update_articulo_factura(session=session, db_articulo=articulo, articulo_in=articulo_in)
    return articulo


@router.delete(
    "/{articulo_id}",
    dependencies=[Depends(require_permissions(BILL_DELETE))],
    response_model=Message,
)
def delete_articulo_factura(
    *,
    session: SessionDep,
    articulo_id: uuid.UUID,
) -> Any:
    """
    Eliminar un artículo de factura.
    Actualiza los totales de la factura asociada.
    Requiere permiso: BILL_DELETE
    """
    success = crud.delete_articulo_factura(session=session, articulo_id=articulo_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="El artículo de factura con este ID no existe.",
        )
    
    return Message(message="Artículo de factura eliminado correctamente")
