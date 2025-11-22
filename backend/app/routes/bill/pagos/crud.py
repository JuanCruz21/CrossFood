import uuid
from typing import Any
from datetime import datetime

from sqlmodel import Session, select

from models.bill.pagos import Pago, PagoCreate, PagoUpdate


def validar_monto_pago(*, session: Session, factura_id: uuid.UUID, monto: float) -> bool:
    """
    Validar que el monto del pago no exceda el saldo pendiente de la factura.
    Retorna True si el monto es válido, False si excede el saldo pendiente.
    """
    from app.routes.bill.factura.crud import get_saldo_pendiente
    
    saldo_pendiente = get_saldo_pendiente(session=session, factura_id=factura_id)
    if saldo_pendiente is None:
        return False
    
    return monto <= saldo_pendiente


def actualizar_estado_factura_segun_pagos(*, session: Session, factura_id: uuid.UUID) -> None:
    """
    Actualizar el estado de la factura a 'pagada' si el total de pagos
    completados alcanza o supera el total de la factura.
    """
    from app.routes.bill.factura.crud import get_factura_by_id, get_saldo_pendiente, update_estado_factura
    
    factura = get_factura_by_id(session=session, factura_id=factura_id)
    if not factura:
        return
    
    saldo_pendiente = get_saldo_pendiente(session=session, factura_id=factura_id)
    if saldo_pendiente is not None and saldo_pendiente <= 0:
        # La factura está completamente pagada
        if factura.estado != "pagada" and factura.estado != "cancelada" and factura.estado != "anulada":
            update_estado_factura(session=session, factura_id=factura_id, nuevo_estado="pagada")


def create_pago(*, session: Session, pago_create: PagoCreate) -> Pago:
    """
    Crear un nuevo pago.
    Valida que el monto no exceda el saldo pendiente de la factura.
    Actualiza automáticamente el estado de la factura si queda completamente pagada.
    """
    # Validar monto
    if not validar_monto_pago(session=session, factura_id=pago_create.factura_id, monto=pago_create.monto):
        raise ValueError("El monto del pago excede el saldo pendiente de la factura")
    
    db_obj = Pago.model_validate(pago_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    
    # Actualizar estado de factura si corresponde
    if db_obj.estado == "completado":
        actualizar_estado_factura_segun_pagos(session=session, factura_id=db_obj.factura_id)
    
    return db_obj


def update_pago(*, session: Session, db_pago: Pago, pago_in: PagoUpdate) -> Pago:
    """
    Actualizar un pago existente.
    Si se modifica el monto o el estado, valida y actualiza el estado de la factura.
    """
    pago_data = pago_in.model_dump(exclude_unset=True)
    
    # Si se actualiza el monto o factura_id, validar
    nuevo_monto = pago_data.get('monto', db_pago.monto)
    nueva_factura_id = pago_data.get('factura_id', db_pago.factura_id)
    
    if 'monto' in pago_data or 'factura_id' in pago_data:
        # Restar el monto anterior si es de la misma factura
        # Esta validación es simplificada; en producción podría ser más compleja
        if not validar_monto_pago(session=session, factura_id=nueva_factura_id, monto=nuevo_monto):
            raise ValueError("El monto del pago excede el saldo pendiente de la factura")
    
    factura_id_original = db_pago.factura_id
    
    db_pago.sqlmodel_update(pago_data)
    session.add(db_pago)
    session.commit()
    session.refresh(db_pago)
    
    # Actualizar estado de factura(s) afectada(s)
    if db_pago.estado == "completado":
        actualizar_estado_factura_segun_pagos(session=session, factura_id=db_pago.factura_id)
    
    # Si cambió de factura, actualizar también la original
    if factura_id_original != db_pago.factura_id:
        actualizar_estado_factura_segun_pagos(session=session, factura_id=factura_id_original)
    
    return db_pago


def get_pago_by_id(*, session: Session, pago_id: uuid.UUID) -> Pago | None:
    """
    Obtener un pago por su ID.
    """
    return session.get(Pago, pago_id)


def get_pagos_by_factura(*, session: Session, factura_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Pago]:
    """
    Obtener todos los pagos de una factura con paginación.
    """
    statement = select(Pago).where(
        Pago.factura_id == factura_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_pagos_by_metodo(*, session: Session, metodo_pago: str, skip: int = 0, limit: int = 100) -> list[Pago]:
    """
    Obtener todos los pagos por método de pago con paginación.
    Métodos: efectivo, tarjeta_credito, tarjeta_debito, transferencia, otro
    """
    statement = select(Pago).where(
        Pago.metodo_pago == metodo_pago
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_pagos_by_estado(*, session: Session, estado: str, skip: int = 0, limit: int = 100) -> list[Pago]:
    """
    Obtener todos los pagos por estado con paginación.
    Estados: completado, pendiente, fallido, reembolsado
    """
    statement = select(Pago).where(
        Pago.estado == estado
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_pagos_by_fecha_range(
    *, 
    session: Session, 
    fecha_inicio: datetime, 
    fecha_fin: datetime, 
    skip: int = 0, 
    limit: int = 100
) -> list[Pago]:
    """
    Obtener pagos dentro de un rango de fechas.
    """
    statement = select(Pago).where(
        Pago.fecha_pago >= fecha_inicio,
        Pago.fecha_pago <= fecha_fin
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_pagos_by_procesador(*, session: Session, procesado_por: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Pago]:
    """
    Obtener todos los pagos procesados por un usuario específico.
    """
    statement = select(Pago).where(
        Pago.procesado_por == procesado_por
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_pagos(*, session: Session, skip: int = 0, limit: int = 100) -> list[Pago]:
    """
    Obtener todos los pagos con paginación.
    """
    statement = select(Pago).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_estado_pago(*, session: Session, pago_id: uuid.UUID, nuevo_estado: str) -> Pago | None:
    """
    Actualizar el estado de un pago.
    Actualiza el estado de la factura si el pago se completa.
    Estados válidos: completado, pendiente, fallido, reembolsado
    """
    pago = session.get(Pago, pago_id)
    if not pago:
        return None
    
    pago.estado = nuevo_estado
    session.add(pago)
    session.commit()
    session.refresh(pago)
    
    # Actualizar estado de factura si el pago se completó o se reembolsó
    if nuevo_estado in ["completado", "reembolsado"]:
        actualizar_estado_factura_segun_pagos(session=session, factura_id=pago.factura_id)
    
    return pago


def calcular_total_pagos_factura(*, session: Session, factura_id: uuid.UUID, solo_completados: bool = True) -> float:
    """
    Calcular el total de pagos de una factura.
    Por defecto solo suma pagos completados.
    """
    if solo_completados:
        statement = select(Pago).where(
            Pago.factura_id == factura_id,
            Pago.estado == "completado"
        )
    else:
        statement = select(Pago).where(Pago.factura_id == factura_id)
    
    pagos = session.exec(statement).all()
    return sum(pago.monto for pago in pagos)


def delete_pago(*, session: Session, pago_id: uuid.UUID) -> bool:
    """
    Eliminar un pago.
    Solo se puede eliminar si el estado != completado para evitar inconsistencias.
    Retorna True si se eliminó correctamente, False si no existía o no se puede eliminar.
    """
    pago = session.get(Pago, pago_id)
    if not pago:
        return False
    
    # No permitir eliminar pagos completados
    if pago.estado == "completado":
        return False
    
    factura_id = pago.factura_id
    
    session.delete(pago)
    session.commit()
    
    # Actualizar estado de factura por si acaso
    actualizar_estado_factura_segun_pagos(session=session, factura_id=factura_id)
    
    return True
