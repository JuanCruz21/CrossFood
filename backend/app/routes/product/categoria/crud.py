import uuid
from typing import Any

from sqlmodel import Session, select

from models.product.categoria import Categoria, CategoriaCreate, CategoriaUpdate


def create_categoria(*, session: Session, categoria_create: CategoriaCreate) -> Categoria:
    """
    Crear una nueva categoría.
    """
    db_obj = Categoria.model_validate(categoria_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_categoria(*, session: Session, db_categoria: Categoria, categoria_in: CategoriaUpdate) -> Categoria:
    """
    Actualizar una categoría existente.
    """
    categoria_data = categoria_in.model_dump(exclude_unset=True)
    db_categoria.sqlmodel_update(categoria_data)
    session.add(db_categoria)
    session.commit()
    session.refresh(db_categoria)
    return db_categoria


def get_categoria_by_nombre(*, session: Session, nombre: str, restaurante_id: uuid.UUID) -> Categoria | None:
    """
    Obtener una categoría por su nombre en un restaurante específico.
    """
    statement = select(Categoria).where(
        Categoria.nombre == nombre,
        Categoria.restaurante_id == restaurante_id
    )
    return session.exec(statement).first()


def get_categoria_by_id(*, session: Session, categoria_id: uuid.UUID) -> Categoria | None:
    """
    Obtener una categoría por su ID.
    """
    return session.get(Categoria, categoria_id)


def get_categorias_by_restaurante(*, session: Session, restaurante_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Categoria]:
    """
    Obtener todas las categorías de un restaurante con paginación.
    """
    statement = select(Categoria).where(
        Categoria.restaurante_id == restaurante_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_categorias(*, session: Session, skip: int = 0, limit: int = 100) -> list[Categoria]:
    """
    Obtener todas las categorías con paginación.
    """
    statement = select(Categoria).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def delete_categoria(*, session: Session, categoria_id: uuid.UUID) -> bool:
    """
    Eliminar una categoría.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        return False
    session.delete(categoria)
    session.commit()
    return True
