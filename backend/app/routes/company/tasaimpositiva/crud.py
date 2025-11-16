import uuid
from typing import Any

from sqlmodel import Session, select

from models.company.tasaimpositiva import TasaImpositiva, TasaImpositivaCreate, TasaImpositivaUpdate


def create_tasa_impositiva(*, session: Session, tasa_create: TasaImpositivaCreate) -> TasaImpositiva:
    """
    Crear una nueva tasa impositiva.
    """
    db_obj = TasaImpositiva.model_validate(tasa_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_tasa_impositiva(*, session: Session, db_tasa: TasaImpositiva, tasa_in: TasaImpositivaUpdate) -> TasaImpositiva:
    """
    Actualizar una tasa impositiva existente.
    """
    tasa_data = tasa_in.model_dump(exclude_unset=True)
    db_tasa.sqlmodel_update(tasa_data)
    session.add(db_tasa)
    session.commit()
    session.refresh(db_tasa)
    return db_tasa


def get_tasa_impositiva_by_nombre(*, session: Session, nombre: str) -> TasaImpositiva | None:
    """
    Obtener una tasa impositiva por su nombre.
    """
    statement = select(TasaImpositiva).where(TasaImpositiva.nombre == nombre)
    return session.exec(statement).first()


def get_tasa_impositiva_by_id(*, session: Session, tasa_id: uuid.UUID) -> TasaImpositiva | None:
    """
    Obtener una tasa impositiva por su ID.
    """
    return session.get(TasaImpositiva, tasa_id)


def get_all_tasas_impositivas(*, session: Session, skip: int = 0, limit: int = 100) -> list[TasaImpositiva]:
    """
    Obtener todas las tasas impositivas con paginación.
    """
    statement = select(TasaImpositiva).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def delete_tasa_impositiva(*, session: Session, tasa_id: uuid.UUID) -> bool:
    """
    Eliminar una tasa impositiva.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    tasa = session.get(TasaImpositiva, tasa_id)
    if not tasa:
        return False
    session.delete(tasa)
    session.commit()
    return True
