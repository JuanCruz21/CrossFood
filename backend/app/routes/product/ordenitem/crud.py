import uuid
from typing import Any

from sqlmodel import Session, select

from models.product.ordenitem import OrdenItem, OrdenItemCreate, OrdenItemUpdate


def create_orden_item(*, session: Session, orden_item_create: OrdenItemCreate) -> OrdenItem:
    """
    Crear un nuevo item de orden.
    """
    db_obj = OrdenItem.model_validate(orden_item_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_orden_item(*, session: Session, db_orden_item: OrdenItem, orden_item_in: OrdenItemUpdate) -> OrdenItem:
    """
    Actualizar un item de orden existente.
    """
    orden_item_data = orden_item_in.model_dump(exclude_unset=True)
    db_orden_item.sqlmodel_update(orden_item_data)
    session.add(db_orden_item)
    session.commit()
    session.refresh(db_orden_item)
    return db_orden_item


def get_orden_item_by_id(*, session: Session, orden_item_id: uuid.UUID) -> OrdenItem | None:
    """
    Obtener un item de orden por su ID.
    """
    return session.get(OrdenItem, orden_item_id)


def get_orden_items_by_orden(*, session: Session, orden_id: uuid.UUID) -> list[OrdenItem]:
    """
    Obtener todos los items de una orden.
    """
    statement = select(OrdenItem).where(OrdenItem.orden_id == orden_id)
    return list(session.exec(statement).all())


def get_orden_items_by_producto(*, session: Session, producto_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[OrdenItem]:
    """
    Obtener todos los items de orden de un producto con paginación.
    """
    statement = select(OrdenItem).where(
        OrdenItem.producto_id == producto_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_cantidad_item(*, session: Session, orden_item_id: uuid.UUID, nueva_cantidad: int) -> OrdenItem | None:
    """
    Actualizar la cantidad de un item de orden.
    """
    orden_item = session.get(OrdenItem, orden_item_id)
    if not orden_item:
        return None
    orden_item.cantidad = nueva_cantidad
    session.add(orden_item)
    session.commit()
    session.refresh(orden_item)
    return orden_item


def delete_orden_item(*, session: Session, orden_item_id: uuid.UUID) -> bool:
    """
    Eliminar un item de orden.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    orden_item = session.get(OrdenItem, orden_item_id)
    if not orden_item:
        return False
    session.delete(orden_item)
    session.commit()
    return True


def delete_orden_items_by_orden(*, session: Session, orden_id: uuid.UUID) -> int:
    """
    Eliminar todos los items de una orden.
    Retorna el número de items eliminados.
    """
    statement = select(OrdenItem).where(OrdenItem.orden_id == orden_id)
    items = list(session.exec(statement).all())
    count = len(items)
    for item in items:
        session.delete(item)
    session.commit()
    return count
