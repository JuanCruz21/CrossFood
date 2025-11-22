import uuid
from typing import Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select

from app.routes.bill.pagos import crud
from app.routes.deps import SessionDep, CurrentUser, require_permissions
from app.routes.auth.permisos.permissions import BILL_READ, BILL_WRITE, BILL_DELETE
from models.bill.pagos import (
    Pago,
    PagoCreate,
    PagoPublic,
    PagosPublic,
    PagoUpdate,
    PagoEstadoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/pagos", tags=["pagos"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagosPublic,
)
def read_pagos(
    session: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todos los pagos con paginación.
    Requiere permiso: BILL_READ
    """
    pagos = crud.get_all_pagos(session=session, skip=skip, limit=limit)
    
    count_statement = select(func.count()).select_from(Pago)
    count = session.exec(count_statement).one()
    
    return PagosPublic(data=pagos, count=count)


@router.get(
    "/{pago_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagoPublic,
)
def read_pago(
    *,
    session: SessionDep,
    pago_id: uuid.UUID,
) -> Any:
    """
    Obtener un pago específico por ID.
    Requiere permiso: BILL_READ
    """
    pago = crud.get_pago_by_id(session=session, pago_id=pago_id)
    if not pago:
        raise HTTPException(
            status_code=404,
            detail="El pago con este ID no existe.",
        )
    return pago


@router.get(
    "/factura/{factura_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagosPublic,
)
def read_pagos_by_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todos los pagos de una factura específica.
    Requiere permiso: BILL_READ
    """
    pagos = crud.get_pagos_by_factura(
        session=session, factura_id=factura_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Pago).where(
        Pago.factura_id == factura_id
    )
    count = session.exec(count_statement).one()
    
    return PagosPublic(data=pagos, count=count)


@router.get(
    "/factura/{factura_id}/total",
    dependencies=[Depends(require_permissions(BILL_READ))],
)
def read_total_pagos_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
    solo_completados: bool = True,
) -> Any:
    """
    Obtener el total de pagos de una factura.
    Por defecto solo suma pagos completados.
    Requiere permiso: BILL_READ
    """
    total = crud.calcular_total_pagos_factura(
        session=session, factura_id=factura_id, solo_completados=solo_completados
    )
    return {
        "factura_id": factura_id,
        "total_pagos": total,
        "solo_completados": solo_completados
    }


@router.get(
    "/metodo/{metodo_pago}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagosPublic,
)
def read_pagos_by_metodo(
    *,
    session: SessionDep,
    metodo_pago: str,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener pagos por método de pago (efectivo, tarjeta_credito, tarjeta_debito, transferencia, otro).
    Requiere permiso: BILL_READ
    """
    metodos_validos = ["efectivo", "tarjeta_credito", "tarjeta_debito", "transferencia", "otro"]
    if metodo_pago not in metodos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Método inválido. Métodos válidos: {', '.join(metodos_validos)}",
        )
    
    pagos = crud.get_pagos_by_metodo(
        session=session, metodo_pago=metodo_pago, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Pago).where(
        Pago.metodo_pago == metodo_pago
    )
    count = session.exec(count_statement).one()
    
    return PagosPublic(data=pagos, count=count)


@router.get(
    "/estado/{estado}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagosPublic,
)
def read_pagos_by_estado(
    *,
    session: SessionDep,
    estado: str,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener pagos por estado (completado, pendiente, fallido, reembolsado).
    Requiere permiso: BILL_READ
    """
    estados_validos = ["completado", "pendiente", "fallido", "reembolsado"]
    if estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Estados válidos: {', '.join(estados_validos)}",
        )
    
    pagos = crud.get_pagos_by_estado(
        session=session, estado=estado, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Pago).where(
        Pago.estado == estado
    )
    count = session.exec(count_statement).one()
    
    return PagosPublic(data=pagos, count=count)


@router.get(
    "/fecha/rango",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagosPublic,
)
def read_pagos_by_fecha_range(
    *,
    session: SessionDep,
    fecha_inicio: datetime,
    fecha_fin: datetime,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener pagos dentro de un rango de fechas.
    Requiere permiso: BILL_READ
    """
    pagos = crud.get_pagos_by_fecha_range(
        session=session,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        skip=skip,
        limit=limit
    )
    
    count_statement = select(func.count()).select_from(Pago).where(
        Pago.fecha_pago >= fecha_inicio,
        Pago.fecha_pago <= fecha_fin
    )
    count = session.exec(count_statement).one()
    
    return PagosPublic(data=pagos, count=count)


@router.get(
    "/procesador/{procesador_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=PagosPublic,
)
def read_pagos_by_procesador(
    *,
    session: SessionDep,
    procesador_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todos los pagos procesados por un usuario específico.
    Requiere permiso: BILL_READ
    """
    pagos = crud.get_pagos_by_procesador(
        session=session, procesado_por=procesador_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(Pago).where(
        Pago.procesado_por == procesador_id
    )
    count = session.exec(count_statement).one()
    
    return PagosPublic(data=pagos, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=PagoPublic,
)
def create_pago(
    *,
    session: SessionDep,
    pago_in: PagoCreate,
    current_user: CurrentUser,
) -> Any:
    """
    Crear un nuevo pago.
    Valida que el monto no exceda el saldo pendiente de la factura.
    Actualiza automáticamente el estado de la factura si queda completamente pagada.
    Requiere permiso: BILL_WRITE
    """
    try:
        # Asignar el usuario actual como procesador si no se especifica
        if not pago_in.procesado_por:
            pago_data = pago_in.model_dump()
            pago_data['procesado_por'] = current_user.id
            pago_in = PagoCreate.model_validate(pago_data)
        
        pago = crud.create_pago(session=session, pago_create=pago_in)
        return pago
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.patch(
    "/{pago_id}",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=PagoPublic,
)
def update_pago(
    *,
    session: SessionDep,
    pago_id: uuid.UUID,
    pago_in: PagoUpdate,
) -> Any:
    """
    Actualizar un pago existente.
    Si se modifica el monto o el estado, valida y actualiza el estado de la factura.
    Requiere permiso: BILL_WRITE
    """
    pago = crud.get_pago_by_id(session=session, pago_id=pago_id)
    if not pago:
        raise HTTPException(
            status_code=404,
            detail="El pago con este ID no existe.",
        )
    
    try:
        pago = crud.update_pago(session=session, db_pago=pago, pago_in=pago_in)
        return pago
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.patch(
    "/{pago_id}/estado",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=PagoPublic,
)
def update_pago_estado(
    *,
    session: SessionDep,
    pago_id: uuid.UUID,
    estado_update: PagoEstadoUpdate,
) -> Any:
    """
    Actualizar el estado de un pago.
    Actualiza el estado de la factura si el pago se completa o se reembolsa.
    Estados válidos: completado, pendiente, fallido, reembolsado
    Requiere permiso: BILL_WRITE
    """
    estados_validos = ["completado", "pendiente", "fallido", "reembolsado"]
    if estado_update.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Estados válidos: {', '.join(estados_validos)}",
        )
    
    pago = crud.update_estado_pago(session=session, pago_id=pago_id, nuevo_estado=estado_update.estado)
    if not pago:
        raise HTTPException(
            status_code=404,
            detail="El pago con este ID no existe.",
        )
    
    return pago


@router.delete(
    "/{pago_id}",
    dependencies=[Depends(require_permissions(BILL_DELETE))],
    response_model=Message,
)
def delete_pago(
    *,
    session: SessionDep,
    pago_id: uuid.UUID,
) -> Any:
    """
    Eliminar un pago.
    Solo se pueden eliminar pagos en estado 'pendiente' o 'fallido'.
    Requiere permiso: BILL_DELETE
    """
    pago = crud.get_pago_by_id(session=session, pago_id=pago_id)
    if not pago:
        raise HTTPException(
            status_code=404,
            detail="El pago con este ID no existe.",
        )
    
    if pago.estado not in ["pendiente", "fallido"]:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden eliminar pagos en estado 'pendiente' o 'fallido'.",
        )
    
    session.delete(pago)
    session.commit()
    
    return Message(message="Pago eliminado correctamente")
