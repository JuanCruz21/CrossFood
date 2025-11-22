import uuid
from typing import Any
from datetime import datetime

from sqlmodel import Session, select

from models.bill.correccionfactura import CorreccionFactura, CorreccionFacturaCreate, CorreccionFacturaUpdate


def create_correccion_factura(*, session: Session, correccion_create: CorreccionFacturaCreate) -> CorreccionFactura:
    """
    Crear una nueva corrección de factura.
    Se crea con estado 'pendiente' por defecto.
    """
    db_obj = CorreccionFactura.model_validate(correccion_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_correccion_factura(
    *, 
    session: Session, 
    db_correccion: CorreccionFactura, 
    correccion_in: CorreccionFacturaUpdate
) -> CorreccionFactura:
    """
    Actualizar una corrección de factura existente.
    """
    correccion_data = correccion_in.model_dump(exclude_unset=True)
    db_correccion.sqlmodel_update(correccion_data)
    session.add(db_correccion)
    session.commit()
    session.refresh(db_correccion)
    return db_correccion


def get_correccion_by_id(*, session: Session, correccion_id: uuid.UUID) -> CorreccionFactura | None:
    """
    Obtener una corrección de factura por su ID.
    """
    return session.get(CorreccionFactura, correccion_id)


def get_correcciones_by_factura_original(
    *, 
    session: Session, 
    factura_original_id: uuid.UUID, 
    skip: int = 0, 
    limit: int = 100
) -> list[CorreccionFactura]:
    """
    Obtener todas las correcciones de una factura original con paginación.
    """
    statement = select(CorreccionFactura).where(
        CorreccionFactura.factura_original_id == factura_original_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_correcciones_by_tipo(
    *, 
    session: Session, 
    tipo_correccion: str, 
    skip: int = 0, 
    limit: int = 100
) -> list[CorreccionFactura]:
    """
    Obtener todas las correcciones por tipo con paginación.
    Tipos: anulacion, devolucion, ajuste, nota_credito, nota_debito
    """
    statement = select(CorreccionFactura).where(
        CorreccionFactura.tipo_correccion == tipo_correccion
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_correcciones_by_estado(
    *, 
    session: Session, 
    estado: str, 
    skip: int = 0, 
    limit: int = 100
) -> list[CorreccionFactura]:
    """
    Obtener todas las correcciones por estado con paginación.
    Estados: pendiente, aprobada, rechazada
    """
    statement = select(CorreccionFactura).where(
        CorreccionFactura.estado == estado
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_correcciones_pendientes(*, session: Session, skip: int = 0, limit: int = 100) -> list[CorreccionFactura]:
    """
    Obtener todas las correcciones pendientes de aprobación.
    """
    statement = select(CorreccionFactura).where(
        CorreccionFactura.estado == "pendiente"
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_correcciones_by_realizado_por(
    *, 
    session: Session, 
    realizado_por: uuid.UUID, 
    skip: int = 0, 
    limit: int = 100
) -> list[CorreccionFactura]:
    """
    Obtener todas las correcciones realizadas por un usuario específico.
    """
    statement = select(CorreccionFactura).where(
        CorreccionFactura.realizado_por == realizado_por
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_correcciones(*, session: Session, skip: int = 0, limit: int = 100) -> list[CorreccionFactura]:
    """
    Obtener todas las correcciones con paginación.
    """
    statement = select(CorreccionFactura).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def aprobar_correccion(
    *, 
    session: Session, 
    correccion_id: uuid.UUID, 
    aprobado_por: uuid.UUID,
    aplicar_correccion: bool = True
) -> CorreccionFactura | None:
    """
    Aprobar una corrección de factura.
    - Cambia el estado a 'aprobada'
    - Asigna el usuario que aprobó
    - Opcionalmente aplica la corrección a la factura (por defecto True)
    """
    correccion = session.get(CorreccionFactura, correccion_id)
    if not correccion:
        return None
    
    if correccion.estado != "pendiente":
        raise ValueError("Solo se pueden aprobar correcciones en estado pendiente")
    
    correccion.estado = "aprobada"
    correccion.aprobado_por = aprobado_por
    session.add(correccion)
    session.commit()
    session.refresh(correccion)
    
    # Aplicar la corrección a la factura si se solicita
    if aplicar_correccion:
        _aplicar_correccion_a_factura(session=session, correccion=correccion)
    
    return correccion


def rechazar_correccion(
    *, 
    session: Session, 
    correccion_id: uuid.UUID, 
    aprobado_por: uuid.UUID
) -> CorreccionFactura | None:
    """
    Rechazar una corrección de factura.
    - Cambia el estado a 'rechazada'
    - Asigna el usuario que rechazó
    """
    correccion = session.get(CorreccionFactura, correccion_id)
    if not correccion:
        return None
    
    if correccion.estado != "pendiente":
        raise ValueError("Solo se pueden rechazar correcciones en estado pendiente")
    
    correccion.estado = "rechazada"
    correccion.aprobado_por = aprobado_por
    session.add(correccion)
    session.commit()
    session.refresh(correccion)
    
    return correccion


def _aplicar_correccion_a_factura(*, session: Session, correccion: CorreccionFactura) -> None:
    """
    Aplicar la corrección a la factura original según el tipo de corrección.
    Esta es una función interna que se llama desde aprobar_correccion.
    
    Tipos de corrección y sus efectos:
    - anulacion: Cambia el estado de la factura a 'anulada'
    - devolucion: Ajusta el total de la factura restando el monto de corrección
    - ajuste: Ajusta el total de la factura con el monto de corrección (puede ser positivo o negativo)
    - nota_credito: Crea una factura de corrección con monto negativo
    - nota_debito: Crea una factura de corrección con monto positivo
    """
    from app.routes.bill.factura.crud import get_factura_by_id, update_estado_factura
    from models.bill.factura import Factura
    
    factura = get_factura_by_id(session=session, factura_id=correccion.factura_original_id)
    if not factura:
        return
    
    tipo = correccion.tipo_correccion
    
    if tipo == "anulacion":
        # Anular la factura
        update_estado_factura(session=session, factura_id=factura.id, nuevo_estado="anulada")
    
    elif tipo == "devolucion":
        # Ajustar el total de la factura (restar el monto de devolución)
        factura.total -= correccion.monto_correccion
        factura.total = max(0, factura.total)  # No permitir totales negativos
        session.add(factura)
        session.commit()
    
    elif tipo == "ajuste":
        # Ajustar el total de la factura (puede ser positivo o negativo)
        factura.total += correccion.monto_correccion
        factura.total = max(0, factura.total)  # No permitir totales negativos
        session.add(factura)
        session.commit()
    
    elif tipo in ["nota_credito", "nota_debito"]:
        # Crear una factura de corrección si se especificó
        if correccion.factura_correccion_id:
            # Ya existe una factura de corrección asociada, no hacer nada
            pass
        # En un caso real, aquí se podría crear una nueva factura automáticamente
        # pero esto depende de la lógica de negocio específica


def delete_correccion_factura(*, session: Session, correccion_id: uuid.UUID) -> bool:
    """
    Eliminar una corrección de factura.
    Solo se puede eliminar si el estado es 'pendiente'.
    Retorna True si se eliminó correctamente, False si no existía o ya está aprobada/rechazada.
    """
    correccion = session.get(CorreccionFactura, correccion_id)
    if not correccion:
        return False
    
    # Solo permitir eliminar correcciones pendientes
    if correccion.estado != "pendiente":
        return False
    
    session.delete(correccion)
    session.commit()
    return True
