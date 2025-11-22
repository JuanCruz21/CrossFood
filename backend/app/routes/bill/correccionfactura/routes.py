import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select

from app.routes.bill.correccionfactura import crud
from app.routes.deps import SessionDep, CurrentUser, require_permissions
from app.routes.auth.permisos.permissions import BILL_READ, BILL_WRITE, BILL_DELETE
from models.bill.correccionfactura import (
    CorreccionFactura,
    CorreccionFacturaCreate,
    CorreccionFacturaPublic,
    CorreccionesFacturaPublic,
    CorreccionFacturaUpdate,
    CorreccionFacturaEstadoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/correcciones-factura", tags=["correcciones-factura"])


@router.get(
    "/",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionesFacturaPublic,
)
def read_correcciones(
    session: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las correcciones de factura con paginación.
    Requiere permiso: BILL_READ
    """
    correcciones = crud.get_all_correcciones(session=session, skip=skip, limit=limit)
    
    count_statement = select(func.count()).select_from(CorreccionFactura)
    count = session.exec(count_statement).one()
    
    return CorreccionesFacturaPublic(data=correcciones, count=count)


@router.get(
    "/{correccion_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionFacturaPublic,
)
def read_correccion(
    *,
    session: SessionDep,
    correccion_id: uuid.UUID,
) -> Any:
    """
    Obtener una corrección de factura específica por ID.
    Requiere permiso: BILL_READ
    """
    correccion = crud.get_correccion_by_id(session=session, correccion_id=correccion_id)
    if not correccion:
        raise HTTPException(
            status_code=404,
            detail="La corrección de factura con este ID no existe.",
        )
    return correccion


@router.get(
    "/factura/{factura_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionesFacturaPublic,
)
def read_correcciones_by_factura(
    *,
    session: SessionDep,
    factura_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las correcciones de una factura específica.
    Requiere permiso: BILL_READ
    """
    correcciones = crud.get_correcciones_by_factura_original(
        session=session, factura_original_id=factura_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(CorreccionFactura).where(
        CorreccionFactura.factura_original_id == factura_id
    )
    count = session.exec(count_statement).one()
    
    return CorreccionesFacturaPublic(data=correcciones, count=count)


@router.get(
    "/tipo/{tipo_correccion}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionesFacturaPublic,
)
def read_correcciones_by_tipo(
    *,
    session: SessionDep,
    tipo_correccion: str,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener correcciones por tipo (anulacion, devolucion, ajuste, nota_credito, nota_debito).
    Requiere permiso: BILL_READ
    """
    tipos_validos = ["anulacion", "devolucion", "ajuste", "nota_credito", "nota_debito"]
    if tipo_correccion not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo inválido. Tipos válidos: {', '.join(tipos_validos)}",
        )
    
    correcciones = crud.get_correcciones_by_tipo(
        session=session, tipo_correccion=tipo_correccion, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(CorreccionFactura).where(
        CorreccionFactura.tipo_correccion == tipo_correccion
    )
    count = session.exec(count_statement).one()
    
    return CorreccionesFacturaPublic(data=correcciones, count=count)


@router.get(
    "/estado/{estado}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionesFacturaPublic,
)
def read_correcciones_by_estado(
    *,
    session: SessionDep,
    estado: str,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener correcciones por estado (pendiente, aprobada, rechazada).
    Requiere permiso: BILL_READ
    """
    estados_validos = ["pendiente", "aprobada", "rechazada"]
    if estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Estados válidos: {', '.join(estados_validos)}",
        )
    
    correcciones = crud.get_correcciones_by_estado(
        session=session, estado=estado, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(CorreccionFactura).where(
        CorreccionFactura.estado == estado
    )
    count = session.exec(count_statement).one()
    
    return CorreccionesFacturaPublic(data=correcciones, count=count)


@router.get(
    "/pendientes/",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionesFacturaPublic,
)
def read_correcciones_pendientes(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las correcciones pendientes de aprobación.
    Requiere permiso: BILL_READ
    """
    correcciones = crud.get_correcciones_pendientes(
        session=session, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(CorreccionFactura).where(
        CorreccionFactura.estado == "pendiente"
    )
    count = session.exec(count_statement).one()
    
    return CorreccionesFacturaPublic(data=correcciones, count=count)


@router.get(
    "/usuario/{usuario_id}",
    dependencies=[Depends(require_permissions(BILL_READ))],
    response_model=CorreccionesFacturaPublic,
)
def read_correcciones_by_usuario(
    *,
    session: SessionDep,
    usuario_id: uuid.UUID,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
) -> Any:
    """
    Obtener todas las correcciones realizadas por un usuario específico.
    Requiere permiso: BILL_READ
    """
    correcciones = crud.get_correcciones_by_realizado_por(
        session=session, realizado_por=usuario_id, skip=skip, limit=limit
    )
    
    count_statement = select(func.count()).select_from(CorreccionFactura).where(
        CorreccionFactura.realizado_por == usuario_id
    )
    count = session.exec(count_statement).one()
    
    return CorreccionesFacturaPublic(data=correcciones, count=count)


@router.post(
    "/",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=CorreccionFacturaPublic,
)
def create_correccion(
    *,
    session: SessionDep,
    correccion_in: CorreccionFacturaCreate,
) -> Any:
    """
    Crear una nueva corrección de factura.
    Se crea con estado 'pendiente' por defecto.
    Requiere permiso: BILL_WRITE
    """
    correccion = crud.create_correccion_factura(session=session, correccion_create=correccion_in)
    return correccion


@router.patch(
    "/{correccion_id}",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=CorreccionFacturaPublic,
)
def update_correccion(
    *,
    session: SessionDep,
    correccion_id: uuid.UUID,
    correccion_in: CorreccionFacturaUpdate,
) -> Any:
    """
    Actualizar una corrección de factura existente.
    Solo se pueden editar correcciones en estado 'pendiente'.
    Requiere permiso: BILL_WRITE
    """
    correccion = crud.get_correccion_by_id(session=session, correccion_id=correccion_id)
    if not correccion:
        raise HTTPException(
            status_code=404,
            detail="La corrección de factura con este ID no existe.",
        )
    
    if correccion.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden editar correcciones en estado pendiente.",
        )
    
    correccion = crud.update_correccion_factura(
        session=session, db_correccion=correccion, correccion_in=correccion_in
    )
    return correccion


@router.patch(
    "/{correccion_id}/aprobar",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=CorreccionFacturaPublic,
)
def aprobar_correccion(
    *,
    session: SessionDep,
    correccion_id: uuid.UUID,
    current_user: CurrentUser,
    aplicar_correccion: bool = True,
) -> Any:
    """
    Aprobar una corrección de factura.
    - Cambia el estado a 'aprobada'
    - Asigna el usuario actual como aprobador
    - Opcionalmente aplica la corrección a la factura (por defecto True)
    Requiere permiso: BILL_WRITE
    """
    try:
        correccion = crud.aprobar_correccion(
            session=session,
            correccion_id=correccion_id,
            aprobado_por=current_user.id,
            aplicar_correccion=aplicar_correccion
        )
        if not correccion:
            raise HTTPException(
                status_code=404,
                detail="La corrección de factura con este ID no existe.",
            )
        return correccion
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.patch(
    "/{correccion_id}/rechazar",
    dependencies=[Depends(require_permissions(BILL_WRITE))],
    response_model=CorreccionFacturaPublic,
)
def rechazar_correccion(
    *,
    session: SessionDep,
    correccion_id: uuid.UUID,
    current_user: CurrentUser,
) -> Any:
    """
    Rechazar una corrección de factura.
    - Cambia el estado a 'rechazada'
    - Asigna el usuario actual como quien rechazó
    Requiere permiso: BILL_WRITE
    """
    try:
        correccion = crud.rechazar_correccion(
            session=session,
            correccion_id=correccion_id,
            aprobado_por=current_user.id
        )
        if not correccion:
            raise HTTPException(
                status_code=404,
                detail="La corrección de factura con este ID no existe.",
            )
        return correccion
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.delete(
    "/{correccion_id}",
    dependencies=[Depends(require_permissions(BILL_DELETE))],
    response_model=Message,
)
def delete_correccion(
    *,
    session: SessionDep,
    correccion_id: uuid.UUID,
) -> Any:
    """
    Eliminar una corrección de factura.
    Solo se pueden eliminar correcciones en estado 'pendiente' o 'rechazada'.
    Requiere permiso: BILL_DELETE
    """
    correccion = crud.get_correccion_by_id(session=session, correccion_id=correccion_id)
    if not correccion:
        raise HTTPException(
            status_code=404,
            detail="La corrección de factura con este ID no existe.",
        )
    
    if correccion.estado == "aprobada":
        raise HTTPException(
            status_code=400,
            detail="No se pueden eliminar correcciones aprobadas.",
        )
    
    session.delete(correccion)
    session.commit()
    
    return Message(message="Corrección de factura eliminada correctamente")
