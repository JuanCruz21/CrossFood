import uuid
from typing import Any

from sqlmodel import Session, select

from models.company.empresa import Empresa, EmpresaCreate, EmpresaUpdate


def create_empresa(*, session: Session, empresa_create: EmpresaCreate) -> Empresa:
    """
    Crear una nueva empresa.
    """
    db_obj = Empresa.model_validate(empresa_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_empresa(*, session: Session, db_empresa: Empresa, empresa_in: EmpresaUpdate) -> Empresa:
    """
    Actualizar una empresa existente.
    """
    empresa_data = empresa_in.model_dump(exclude_unset=True)
    db_empresa.sqlmodel_update(empresa_data)
    session.add(db_empresa)
    session.commit()
    session.refresh(db_empresa)
    return db_empresa


def get_empresa_by_nombre(*, session: Session, nombre: str) -> Empresa | None:
    """
    Obtener una empresa por su nombre.
    """
    statement = select(Empresa).where(Empresa.nombre == nombre)
    return session.exec(statement).first()


def get_empresa_by_id(*, session: Session, empresa_id: uuid.UUID) -> Empresa | None:
    """
    Obtener una empresa por su ID.
    """
    return session.get(Empresa, empresa_id)


def delete_empresa(*, session: Session, empresa_id: uuid.UUID) -> bool:
    """
    Eliminar una empresa.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    empresa = session.get(Empresa, empresa_id)
    if not empresa:
        return False
    session.delete(empresa)
    session.commit()
    return True
