import uuid
from typing import Any
from datetime import datetime

from sqlmodel import Session, select

from models.bill.factura import Factura, FacturaCreate, FacturaUpdate


def create_factura(*, session: Session, factura_create: FacturaCreate) -> Factura:
    """
    Crear una nueva factura.
    """
    db_obj = Factura.model_validate(factura_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_factura(*, session: Session, db_factura: Factura, factura_in: FacturaUpdate) -> Factura:
    """
    Actualizar una factura existente.
    """
    factura_data = factura_in.model_dump(exclude_unset=True)
    db_factura.sqlmodel_update(factura_data)
    session.add(db_factura)
    session.commit()
    session.refresh(db_factura)
    return db_factura


def get_factura_by_id(*, session: Session, factura_id: uuid.UUID) -> Factura | None:
    """
    Obtener una factura por su ID.
    """
    return session.get(Factura, factura_id)


def get_factura_by_numero(*, session: Session, numero_factura: str) -> Factura | None:
    """
    Obtener una factura por su número de factura.
    """
    statement = select(Factura).where(Factura.numero_factura == numero_factura)
    return session.exec(statement).first()


def get_facturas_by_restaurante(*, session: Session, restaurante_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener todas las facturas de un restaurante con paginación.
    """
    statement = select(Factura).where(
        Factura.restaurante_id == restaurante_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_facturas_by_cliente(*, session: Session, cliente_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener todas las facturas de un cliente con paginación.
    """
    statement = select(Factura).where(
        Factura.cliente_id == cliente_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_facturas_by_empresa(*, session: Session, empresa_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener todas las facturas de una empresa con paginación.
    """
    statement = select(Factura).where(
        Factura.empresa_id == empresa_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_facturas_by_estado(*, session: Session, estado: str, restaurante_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener todas las facturas por estado con paginación.
    Opcionalmente filtradas por restaurante.
    Estados: pendiente, pagada, cancelada, anulada
    """
    if restaurante_id:
        statement = select(Factura).where(
            Factura.estado == estado,
            Factura.restaurante_id == restaurante_id
        ).offset(skip).limit(limit)
    else:
        statement = select(Factura).where(
            Factura.estado == estado
        ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_facturas_by_tipo(*, session: Session, tipo_factura: str, restaurante_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener todas las facturas por tipo con paginación.
    Opcionalmente filtradas por restaurante.
    Tipos: venta, compra
    """
    if restaurante_id:
        statement = select(Factura).where(
            Factura.tipo_factura == tipo_factura,
            Factura.restaurante_id == restaurante_id
        ).offset(skip).limit(limit)
    else:
        statement = select(Factura).where(
            Factura.tipo_factura == tipo_factura
        ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_facturas_by_fecha_range(
    *, 
    session: Session, 
    fecha_inicio: datetime, 
    fecha_fin: datetime, 
    restaurante_id: uuid.UUID | None = None,
    skip: int = 0, 
    limit: int = 100
) -> list[Factura]:
    """
    Obtener facturas dentro de un rango de fechas.
    Opcionalmente filtradas por restaurante.
    """
    if restaurante_id:
        statement = select(Factura).where(
            Factura.fecha >= fecha_inicio,
            Factura.fecha <= fecha_fin,
            Factura.restaurante_id == restaurante_id
        ).offset(skip).limit(limit)
    else:
        statement = select(Factura).where(
            Factura.fecha >= fecha_inicio,
            Factura.fecha <= fecha_fin
        ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_facturas_vencidas(*, session: Session, restaurante_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener facturas vencidas (fecha_vencimiento < hoy y estado != pagada).
    Opcionalmente filtradas por restaurante.
    """
    ahora = datetime.utcnow()
    
    if restaurante_id:
        statement = select(Factura).where(
            Factura.fecha_vencimiento < ahora,
            Factura.estado != "pagada",
            Factura.restaurante_id == restaurante_id
        ).offset(skip).limit(limit)
    else:
        statement = select(Factura).where(
            Factura.fecha_vencimiento < ahora,
            Factura.estado != "pagada"
        ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_facturas(*, session: Session, skip: int = 0, limit: int = 100) -> list[Factura]:
    """
    Obtener todas las facturas con paginación.
    """
    statement = select(Factura).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_estado_factura(*, session: Session, factura_id: uuid.UUID, nuevo_estado: str) -> Factura | None:
    """
    Actualizar el estado de una factura.
    Estados válidos: pendiente, pagada, cancelada, anulada
    """
    factura = session.get(Factura, factura_id)
    if not factura:
        return None
    factura.estado = nuevo_estado
    session.add(factura)
    session.commit()
    session.refresh(factura)
    return factura


def calcular_totales_factura(*, session: Session, factura_id: uuid.UUID) -> Factura | None:
    """
    Recalcular subtotal, impuestos y total de una factura basándose en sus artículos.
    Importa ArticuloFactura para evitar dependencias circulares.
    """
    from models.bill.articulofactura import ArticuloFactura
    
    factura = session.get(Factura, factura_id)
    if not factura:
        return None
    
    # Obtener todos los artículos de la factura
    statement = select(ArticuloFactura).where(ArticuloFactura.factura_id == factura_id)
    articulos = session.exec(statement).all()
    
    subtotal_total = sum(articulo.subtotal for articulo in articulos)
    impuestos_total = sum(articulo.impuesto for articulo in articulos)
    total = sum(articulo.total for articulo in articulos)
    
    factura.subtotal = subtotal_total
    factura.impuestos = impuestos_total
    factura.total = total
    
    session.add(factura)
    session.commit()
    session.refresh(factura)
    return factura


def get_saldo_pendiente(*, session: Session, factura_id: uuid.UUID) -> float | None:
    """
    Calcular el saldo pendiente de una factura.
    Saldo = Total factura - Suma de pagos completados
    """
    from models.bill.pagos import Pago
    
    factura = session.get(Factura, factura_id)
    if not factura:
        return None
    
    # Obtener todos los pagos completados de la factura
    statement = select(Pago).where(
        Pago.factura_id == factura_id,
        Pago.estado == "completado"
    )
    pagos = session.exec(statement).all()
    
    total_pagado = sum(pago.monto for pago in pagos)
    saldo_pendiente = factura.total - total_pagado
    
    return max(0, saldo_pendiente)  # No devolver saldo negativo


def delete_factura(*, session: Session, factura_id: uuid.UUID) -> bool:
    """
    Eliminar una factura.
    Solo se puede eliminar si no tiene pagos asociados.
    Retorna True si se eliminó correctamente, False si no existía o tiene pagos.
    """
    from models.bill.pagos import Pago
    
    factura = session.get(Factura, factura_id)
    if not factura:
        return False
    
    # Verificar que no tenga pagos asociados
    statement = select(Pago).where(Pago.factura_id == factura_id)
    pagos = session.exec(statement).first()
    
    if pagos:
        # La factura tiene pagos, no se puede eliminar
        return False
    
    session.delete(factura)
    session.commit()
    return True
