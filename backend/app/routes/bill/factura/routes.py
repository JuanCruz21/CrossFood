import uuid
from typing import Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select

from app.routes.bill.factura import crud
from app.routes.deps import SessionDep, require_permissions
from app.routes.auth.permisos.permissions import BILL_READ, BILL_WRITE, BILL_DELETE
from models.bill.factura import (
    Factura,
    FacturaCreate,
    FacturaPublic,
    FacturasPublic,
    FacturaUpdate,
    FacturaEstadoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/facturas", tags=["facturas"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas(
    session: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las facturas con paginación.
    Requiere permiso: BILL_READ
    """
    facturas = crud.get_all_facturas(session=session, skip=skip, limit=limit)
    
    count_statement = select(func.count()).select_from(Factura)
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/{factura_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturaPublic,
)
def read_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
) -> Any:
    """
    Obtener una factura específica por ID.
    Requiere permiso: BILL_READ
    """
    factura = crud.get_factura_by_id(session=session, factura_id=factura_id)
    if not factura:
        raise HTTPException(
            status_code=404,
            detail="La factura con este ID no existe.",
        )
    return factura


@router.get(
    "/numero/{numero_factura}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturaPublic,
)
def read_factura_by_numero(
    *,
    session: SessionDep,
    numero_factura: str,
) -> Any:
    """
    Obtener una factura específica por número de factura.
    Requiere permiso: BILL_READ
    """
    factura = crud.get_factura_by_numero(session=session, numero_factura=numero_factura)
    if not factura:
        raise HTTPException(
            status_code=404,
            detail="La factura con este número no existe.",
        )
    return factura


@router.get(
    "/restaurante/{restaurante_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_by_restaurante(
    *,
    session: SessionDep,
    restaurante_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las facturas de un restaurante específico.
    Requiere permiso: BILL_READ
    """
    facturas = crud.get_facturas_by_restaurante(
        session=session, restaurante_id=restaurante_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Factura).where(
        Factura.restaurante_id == restaurante_id
    )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/cliente/{cliente_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_by_cliente(
    *,
    session: SessionDep,
    cliente_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las facturas de un cliente específico.
    Requiere permiso: BILL_READ
    """
    facturas = crud.get_facturas_by_cliente(
        session=session, cliente_id=cliente_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Factura).where(
        Factura.cliente_id == cliente_id
    )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/empresa/{empresa_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_by_empresa(
    *,
    session: SessionDep,
    empresa_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las facturas de una empresa específica.
    Requiere permiso: BILL_READ
    """
    facturas = crud.get_facturas_by_empresa(
        session=session, empresa_id=empresa_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Factura).where(
        Factura.empresa_id == empresa_id
    )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/estado/{estado}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_by_estado(
    *,
    session: SessionDep,
    estado: str,
    restaurante_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener facturas por estado (pendiente, pagada, cancelada, anulada).
    Opcionalmente filtradas por restaurante.
    Requiere permiso: BILL_READ
    """
    estados_validos = ["pendiente", "pagada", "cancelada", "anulada"]
    if estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Estados válidos: {', '.join(estados_validos)}",
        )
    
    facturas = crud.get_facturas_by_estado(
        session=session, estado=estado, restaurante_id=restaurante_id, skip=skip, limit=limit
    )
    
    if restaurante_id:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.estado == estado,
            Factura.restaurante_id == restaurante_id
        )
    else:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.estado == estado
        )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/tipo/{tipo_factura}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_by_tipo(
    *,
    session: SessionDep,
    tipo_factura: str,
    restaurante_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener facturas por tipo (venta, compra).
    Opcionalmente filtradas por restaurante.
    Requiere permiso: BILL_READ
    """
    tipos_validos = ["venta", "compra"]
    if tipo_factura not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo inválido. Tipos válidos: {', '.join(tipos_validos)}",
        )
    
    facturas = crud.get_facturas_by_tipo(
        session=session, tipo_factura=tipo_factura, restaurante_id=restaurante_id, skip=skip, limit=limit
    )
    
    if restaurante_id:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.tipo_factura == tipo_factura,
            Factura.restaurante_id == restaurante_id
        )
    else:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.tipo_factura == tipo_factura
        )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/vencidas/",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_vencidas(
    *,
    session: SessionDep,
    restaurante_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener facturas vencidas (fecha_vencimiento < hoy y estado != pagada).
    Opcionalmente filtradas por restaurante.
    Requiere permiso: BILL_READ
    """
    facturas = crud.get_facturas_vencidas(
        session=session, restaurante_id=restaurante_id, skip=skip, limit=limit
    )
    
    ahora = datetime.utcnow()
    if restaurante_id:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.fecha_vencimiento < ahora,
            Factura.estado != "pagada",
            Factura.restaurante_id == restaurante_id
        )
    else:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.fecha_vencimiento < ahora,
            Factura.estado != "pagada"
        )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.get(
    "/fecha/rango",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=FacturasPublic,
)
def read_facturas_by_fecha_range(
    *,
    session: SessionDep,
    fecha_inicio: datetime,
    fecha_fin: datetime,
    restaurante_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener facturas dentro de un rango de fechas.
    Opcionalmente filtradas por restaurante.
    Requiere permiso: BILL_READ
    """
    facturas = crud.get_facturas_by_fecha_range(
        session=session,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        restaurante_id=restaurante_id,
        skip=skip,
        limit=limit
    )
    
    if restaurante_id:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.fecha >= fecha_inicio,
            Factura.fecha <= fecha_fin,
            Factura.restaurante_id == restaurante_id
        )
    else:
        count_statement = select(func.count()).select_from(Factura).where(
            Factura.fecha >= fecha_inicio,
            Factura.fecha <= fecha_fin
        )
    count = session.exec(count_statement).one()
    
    return FacturasPublic(data=facturas, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=FacturaPublic,
)
def create_factura(
    *,
    session: SessionDep,
    factura_in: FacturaCreate,
) -> Any:
    """
    Crear una nueva factura.
    Requiere permiso: BILL_WRITE
    """
    # Verificar si ya existe una factura con ese número
    existing_factura = crud.get_factura_by_numero(session=session, numero_factura=factura_in.numero_factura)
    if existing_factura:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una factura con este número.",
        )
    
    factura = crud.create_factura(session=session, factura_create=factura_in)
    return factura


@router.patch(
    "/{factura_id}",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=FacturaPublic,
)
def update_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
    factura_in: FacturaUpdate,
) -> Any:
    """
    Actualizar una factura existente.
    Requiere permiso: BILL_WRITE
    """
    factura = crud.get_factura_by_id(session=session, factura_id=factura_id)
    if not factura:
        raise HTTPException(
            status_code=404,
            detail="La factura con este ID no existe.",
        )
    
    # Si se actualiza el número de factura, verificar que no exista otro con ese número
    if factura_in.numero_factura and factura_in.numero_factura != factura.numero_factura:
        existing_factura = crud.get_factura_by_numero(session=session, numero_factura=factura_in.numero_factura)
        if existing_factura:
            raise HTTPException(
                status_code=400,
                detail="Ya existe una factura con este número.",
            )
    
    factura = crud.update_factura(session=session, db_factura=factura, factura_in=factura_in)
    return factura


@router.patch(
    "/{factura_id}/estado",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=FacturaPublic,
)
def update_factura_estado(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
    estado_update: FacturaEstadoUpdate,
) -> Any:
    """
    Actualizar el estado de una factura.
    Estados válidos: pendiente, pagada, cancelada, anulada
    Requiere permiso: BILL_WRITE
    """
    estados_validos = ["pendiente", "pagada", "cancelada", "anulada"]
    if estado_update.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Estados válidos: {', '.join(estados_validos)}",
        )
    
    factura = crud.update_estado_factura(session=session, factura_id=factura_id, nuevo_estado=estado_update.estado)
    if not factura:
        raise HTTPException(
            status_code=404,
            detail="La factura con este ID no existe.",
        )
    
    return factura


@router.patch(
    "/{factura_id}/recalcular-totales",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=FacturaPublic,
)
def recalcular_totales_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
) -> Any:
    """
    Recalcular subtotal, impuestos y total de una factura basándose en sus artículos.
    Requiere permiso: BILL_WRITE
    """
    factura = crud.calcular_totales_factura(session=session, factura_id=factura_id)
    if not factura:
        raise HTTPException(
            status_code=404,
            detail="La factura con este ID no existe.",
        )
    
    return factura


@router.delete(
    "/{factura_id}",
    dependencies=[Depends(require_permissions(BILL_DELETE))],
    response_model=Message,
)
def delete_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
) -> Any:
    """
    Eliminar una factura.
    Requiere permiso: BILL_DELETE
    """
    factura = crud.get_factura_by_id(session=session, factura_id=factura_id)
    if not factura:
        raise HTTPException(
            status_code=404,
            detail="La factura con este ID no existe.",
        )
    
    session.delete(factura)
    session.commit()
    
    return Message(message="Factura eliminada correctamente")
