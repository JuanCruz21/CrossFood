import uuid
from typing import Any

from sqlmodel import Session, select

from models.auth.rol import Rol, RolCreate, RolUpdate
from models.auth.roluser import RolUser, RolUserCreate
from models.auth.permisorol import PermisoRol


def create_rol(*, session: Session, rol_create: RolCreate) -> Rol:
    """
    Crear un nuevo rol.
    """
    db_obj = Rol.model_validate(rol_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_rol(*, session: Session, db_rol: Rol, rol_in: RolUpdate) -> Rol:
    """
    Actualizar un rol existente.
    """
    rol_data = rol_in.model_dump(exclude_unset=True)
    db_rol.sqlmodel_update(rol_data)
    session.add(db_rol)
    session.commit()
    session.refresh(db_rol)
    return db_rol


def get_rol_by_name(*, session: Session, name: str) -> Rol | None:
    """
    Obtener un rol por su nombre.
    """
    statement = select(Rol).where(Rol.nombre == name)
    return session.exec(statement).first()


def get_rol_by_id(*, session: Session, rol_id: uuid.UUID) -> Rol | None:
    """
    Obtener un rol por su ID.
    """
    return session.get(Rol, rol_id)


def delete_rol(*, session: Session, rol_id: uuid.UUID) -> bool:
    """
    Eliminar un rol.
    Retorna True si se eliminó correctamente, False si no existe.
    """
    rol = session.get(Rol, rol_id)
    if not rol:
        return False
    session.delete(rol)
    session.commit()
    return True


def assign_rol_to_user(
    *, session: Session, user_id: uuid.UUID, rol_id: uuid.UUID, assigned_by: uuid.UUID
) -> RolUser:
    """
    Asignar un rol a un usuario.
    """
    # Verificar si ya existe la asignación
    statement = select(RolUser).where(
        RolUser.user_id == user_id, RolUser.rol_id == rol_id
    )
    existing = session.exec(statement).first()
    if existing:
        return existing

    rol_user = RolUser(user_id=user_id, rol_id=rol_id, assigned_by=assigned_by)
    session.add(rol_user)
    session.commit()
    session.refresh(rol_user)
    return rol_user


def remove_rol_from_user(
    *, session: Session, user_id: uuid.UUID, rol_id: uuid.UUID
) -> bool:
    """
    Remover un rol de un usuario.
    Retorna True si se removió correctamente, False si no existía la asignación.
    """
    statement = select(RolUser).where(
        RolUser.user_id == user_id, RolUser.rol_id == rol_id
    )
    rol_user = session.exec(statement).first()
    if not rol_user:
        return False
    session.delete(rol_user)
    session.commit()
    return True


def get_user_roles(*, session: Session, user_id: uuid.UUID) -> list[Rol]:
    """
    Obtener todos los roles asignados a un usuario.
    """
    statement = (
        select(Rol)
        .join(RolUser, Rol.id == RolUser.rol_id)
        .where(RolUser.user_id == user_id)
    )
    return list(session.exec(statement).all())


def get_users_with_rol(*, session: Session, rol_id: uuid.UUID) -> list[uuid.UUID]:
    """
    Obtener todos los IDs de usuarios que tienen un rol específico.
    """
    statement = select(RolUser.user_id).where(RolUser.rol_id == rol_id)
    return list(session.exec(statement).all())


def get_rol_permissions(*, session: Session, rol_id: uuid.UUID) -> list[uuid.UUID | None]:
    """
    Obtener todos los IDs de permisos asignados a un rol.
    """
    statement = select(PermisoRol.permiso_id).where(PermisoRol.rol_id == rol_id)
    return list(session.exec(statement).all())
