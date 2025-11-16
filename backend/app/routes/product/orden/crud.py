import uuid
from typing import Any

from sqlmodel import Session, select

from models.product.orden import Orden, OrdenCreate, OrdenUpdate


def create_orden(*, session: Session, orden_create: OrdenCreate) -> Orden:
    """
    Crear una nueva orden.
    """
    db_obj = Orden.model_validate(orden_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_orden(*, session: Session, db_orden: Orden, orden_in: OrdenUpdate) -> Orden:
    """
    Actualizar una orden existente.
    """
    orden_data = orden_in.model_dump(exclude_unset=True)
    db_orden.sqlmodel_update(orden_data)
    session.add(db_orden)
    session.commit()
    session.refresh(db_orden)
    return db_orden


def get_orden_by_id(*, session: Session, orden_id: uuid.UUID) -> Orden | None:
    """
    Obtener una orden por su ID.
    """
    return session.get(Orden, orden_id)


def get_ordenes_by_restaurante(*, session: Session, restaurante_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Orden]:
    """
    Obtener todas las órdenes de un restaurante con paginación.
    """
    statement = select(Orden).where(
        Orden.restaurante_id == restaurante_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_ordenes_by_cliente(*, session: Session, cliente_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Orden]:
    """
    Obtener todas las órdenes de un cliente con paginación.
    """
    statement = select(Orden).where(
        Orden.cliente_id == cliente_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_ordenes_by_mesa(*, session: Session, mesa_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Orden]:
    """
    Obtener todas las órdenes de una mesa con paginación.
    """
    statement = select(Orden).where(
        Orden.mesa_id == mesa_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_ordenes_by_estado(*, session: Session, estado: str, restaurante_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100) -> list[Orden]:
    """
    Obtener todas las órdenes por estado con paginación.
    Opcionalmente filtradas por restaurante.
    """
    if restaurante_id:
        statement = select(Orden).where(
            Orden.estado == estado,
            Orden.restaurante_id == restaurante_id
        ).offset(skip).limit(limit)
    else:
        statement = select(Orden).where(
            Orden.estado == estado
        ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_ordenes(*, session: Session, skip: int = 0, limit: int = 100) -> list[Orden]:
    """
    Obtener todas las órdenes con paginación.
    """
    statement = select(Orden).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_estado_orden(*, session: Session, orden_id: uuid.UUID, nuevo_estado: str) -> Orden | None:
    """
    Actualizar el estado de una orden.
    """
    orden = session.get(Orden, orden_id)
    if not orden:
        return None
    orden.estado = nuevo_estado
    session.add(orden)
    session.commit()
    session.refresh(orden)
    return orden


def delete_orden(*, session: Session, orden_id: uuid.UUID) -> bool:
    """
    Eliminar una orden.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    orden = session.get(Orden, orden_id)
    if not orden:
        return False
    session.delete(orden)
    session.commit()
    return True
