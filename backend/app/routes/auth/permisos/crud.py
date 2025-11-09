import uuid
from typing import Any

from sqlmodel import Session, select, func

from models.auth.permiso import Permiso, PermisoCreate, PermisoUpdate
from models.auth.permisorol import PermisoRol, PermisoRolCreate
from models.auth.permisousuario import PermisoUsuario, PermisoUsuarioCreate


def create_permiso(*, session: Session, permiso_create: PermisoCreate) -> Permiso:
    """
    Crear un nuevo permiso.
    """
    db_obj = Permiso.model_validate(permiso_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_permiso(
    *, session: Session, db_permiso: Permiso, permiso_in: PermisoUpdate
) -> Permiso:
    """
    Actualizar un permiso existente.
    """
    permiso_data = permiso_in.model_dump(exclude_unset=True)
    db_permiso.sqlmodel_update(permiso_data)
    session.add(db_permiso)
    session.commit()
    session.refresh(db_permiso)
    return db_permiso


def get_permiso_by_name(*, session: Session, name: str) -> Permiso | None:
    """
    Obtener un permiso por su nombre.
    """
    statement = select(Permiso).where(Permiso.nombre == name)
    return session.exec(statement).first()


def get_permiso_by_id(*, session: Session, permiso_id: uuid.UUID) -> Permiso | None:
    """
    Obtener un permiso por su ID.
    """
    return session.get(Permiso, permiso_id)


def delete_permiso(*, session: Session, permiso_id: uuid.UUID) -> bool:
    """
    Eliminar un permiso.
    Retorna True si se eliminó correctamente, False si no existe.
    """
    permiso = session.get(Permiso, permiso_id)
    if not permiso:
        return False
    session.delete(permiso)
    session.commit()
    return True


def assign_permiso_to_rol(
    *,
    session: Session,
    permiso_id: uuid.UUID,
    rol_id: uuid.UUID,
    assigned_by: uuid.UUID,
) -> PermisoRol:
    """
    Asignar un permiso a un rol.
    """
    # Verificar si ya existe la asignación
    statement = select(PermisoRol).where(
        PermisoRol.permiso_id == permiso_id, PermisoRol.rol_id == rol_id
    )
    existing = session.exec(statement).first()
    if existing:
        return existing

    permiso_rol = PermisoRol(
        permiso_id=permiso_id, rol_id=rol_id, assigned_by=assigned_by
    )
    session.add(permiso_rol)
    session.commit()
    session.refresh(permiso_rol)
    return permiso_rol


def remove_permiso_from_rol(
    *, session: Session, permiso_id: uuid.UUID, rol_id: uuid.UUID
) -> bool:
    """
    Remover un permiso de un rol.
    Retorna True si se removió correctamente, False si no existía la asignación.
    """
    statement = select(PermisoRol).where(
        PermisoRol.permiso_id == permiso_id, PermisoRol.rol_id == rol_id
    )
    permiso_rol = session.exec(statement).first()
    if not permiso_rol:
        return False
    session.delete(permiso_rol)
    session.commit()
    return True


def assign_permiso_to_user(
    *, session: Session, permiso_id: uuid.UUID, user_id: uuid.UUID
) -> PermisoUsuario:
    """
    Asignar un permiso directamente a un usuario.
    """
    # Verificar si ya existe la asignación
    statement = select(PermisoUsuario).where(
        PermisoUsuario.permiso_id == permiso_id, PermisoUsuario.user_id == user_id
    )
    existing = session.exec(statement).first()
    if existing:
        return existing

    permiso_usuario = PermisoUsuario(permiso_id=permiso_id, user_id=user_id)
    session.add(permiso_usuario)
    session.commit()
    session.refresh(permiso_usuario)
    return permiso_usuario


def remove_permiso_from_user(
    *, session: Session, permiso_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """
    Remover un permiso directo de un usuario.
    Retorna True si se removió correctamente, False si no existía la asignación.
    """
    statement = select(PermisoUsuario).where(
        PermisoUsuario.permiso_id == permiso_id, PermisoUsuario.user_id == user_id
    )
    permiso_usuario = session.exec(statement).first()
    if not permiso_usuario:
        return False
    session.delete(permiso_usuario)
    session.commit()
    return True


def get_user_direct_permissions(
    *, session: Session, user_id: uuid.UUID
) -> list[Permiso]:
    """
    Obtener todos los permisos asignados directamente a un usuario.
    """
    statement = (
        select(Permiso)
        .join(PermisoUsuario, Permiso.id == PermisoUsuario.permiso_id)
        .where(PermisoUsuario.user_id == user_id)
    )
    return list(session.exec(statement).all())


def get_user_all_permissions(*, session: Session, user_id: uuid.UUID) -> set[str]:
    """
    Obtener todos los permisos de un usuario (directos + por roles).
    Retorna un set con los nombres de los permisos.
    """
    # Permisos directos
    direct_permisos = get_user_direct_permissions(session=session, user_id=user_id)
    permisos_set = {p.nombre for p in direct_permisos}

    # Permisos por roles
    from app.routes.auth.roles.crud import get_user_roles

    user_roles = get_user_roles(session=session, user_id=user_id)
    for rol in user_roles:
        statement = (
            select(Permiso)
            .join(PermisoRol, Permiso.id == PermisoRol.permiso_id)
            .where(PermisoRol.rol_id == rol.id)
        )
        rol_permisos = session.exec(statement).all()
        permisos_set.update(p.nombre for p in rol_permisos)

    return permisos_set


def get_rol_permissions_list(*, session: Session, rol_id: uuid.UUID) -> list[Permiso]:
    """
    Obtener todos los permisos asignados a un rol.
    """
    statement = (
        select(Permiso)
        .join(PermisoRol, Permiso.id == PermisoRol.permiso_id)
        .where(PermisoRol.rol_id == rol_id)
    )
    return list(session.exec(statement).all())
