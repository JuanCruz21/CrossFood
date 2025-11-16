import uuid
from typing import Any

from sqlmodel import Session, select

from models.product.producto import Producto, ProductoCreate, ProductoUpdate


def create_producto(*, session: Session, producto_create: ProductoCreate) -> Producto:
    """
    Crear un nuevo producto.
    """
    db_obj = Producto.model_validate(producto_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_producto(*, session: Session, db_producto: Producto, producto_in: ProductoUpdate) -> Producto:
    """
    Actualizar un producto existente.
    """
    producto_data = producto_in.model_dump(exclude_unset=True)
    db_producto.sqlmodel_update(producto_data)
    session.add(db_producto)
    session.commit()
    session.refresh(db_producto)
    return db_producto


def get_producto_by_nombre(*, session: Session, nombre: str) -> Producto | None:
    """
    Obtener un producto por su nombre.
    """
    statement = select(Producto).where(Producto.nombre == nombre)
    return session.exec(statement).first()


def get_producto_by_id(*, session: Session, producto_id: uuid.UUID) -> Producto | None:
    """
    Obtener un producto por su ID.
    """
    return session.get(Producto, producto_id)


def get_productos_by_restaurante(*, session: Session, restaurante_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Producto]:
    """
    Obtener todos los productos de un restaurante con paginación.
    """
    statement = select(Producto).where(
        Producto.restaurante_id == restaurante_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_productos_by_categoria(*, session: Session, categoria_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Producto]:
    """
    Obtener todos los productos de una categoría con paginación.
    """
    statement = select(Producto).where(
        Producto.categoria_id == categoria_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_productos_by_empresa(*, session: Session, empresa_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Producto]:
    """
    Obtener todos los productos de una empresa con paginación.
    """
    statement = select(Producto).where(
        Producto.empresa_id == empresa_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_productos(*, session: Session, skip: int = 0, limit: int = 100) -> list[Producto]:
    """
    Obtener todos los productos con paginación.
    """
    statement = select(Producto).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_stock(*, session: Session, producto_id: uuid.UUID, cantidad: int) -> Producto | None:
    """
    Actualizar el stock de un producto.
    """
    producto = session.get(Producto, producto_id)
    if not producto:
        return None
    producto.stock += cantidad
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


def delete_producto(*, session: Session, producto_id: uuid.UUID) -> bool:
    """
    Eliminar un producto.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    producto = session.get(Producto, producto_id)
    if not producto:
        return False
    session.delete(producto)
    session.commit()
    return True
