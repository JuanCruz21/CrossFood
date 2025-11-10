import uuid
from typing import Any

from sqlmodel import Session, select

from models.company.restaurante import Restaurante, RestauranteCreate, RestauranteUpdate


def create_restaurante(*, session: Session, restaurante_create: RestauranteCreate) -> Restaurante:
    """
    Crear un nuevo restaurante.
    """
    db_obj = Restaurante.model_validate(restaurante_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_restaurante(*, session: Session, db_restaurante: Restaurante, restaurante_in: RestauranteUpdate) -> Restaurante:
    """
    Actualizar un restaurante existente.
    """
    restaurante_data = restaurante_in.model_dump(exclude_unset=True)
    db_restaurante.sqlmodel_update(restaurante_data)
    session.add(db_restaurante)
    session.commit()
    session.refresh(db_restaurante)
    return db_restaurante


def get_restaurante_by_id(*, session: Session, restaurante_id: uuid.UUID) -> Restaurante | None:
    """
    Obtener un restaurante por su ID.
    """
    return session.get(Restaurante, restaurante_id)


def get_restaurantes_by_empresa(*, session: Session, empresa_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Restaurante]:
    """
    Obtener todos los restaurantes de una empresa específica.
    """
    statement = select(Restaurante).where(Restaurante.empresa_id == empresa_id).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def delete_restaurante(*, session: Session, restaurante_id: uuid.UUID) -> bool:
    """
    Eliminar un restaurante.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    restaurante = session.get(Restaurante, restaurante_id)
    if not restaurante:
        return False
    session.delete(restaurante)
    session.commit()
    return True
