import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.auth.permisos import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.auth.permiso import (
    Permiso,
    PermisoCreate,
    PermisoPublic,
    PermisosPublic,
    PermisoUpdate,
)
from models.config import Message

router = APIRouter(prefix="/permisos", tags=["permisos"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisosPublic,
)
def read_permisos(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Obtener lista de permisos.
    Solo accesible para superusuarios.
    """
    count_statement = select(func.count()).select_from(Permiso)
    count = session.exec(count_statement).one()

    statement = select(Permiso).offset(skip).limit(limit)
    permisos = session.exec(statement).all()
    permiso_public_list = [PermisoPublic.model_validate(permiso) for permiso in permisos]

    return PermisosPublic(data=permiso_public_list, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoPublic,
)
def create_permiso(*, session: SessionDep, permiso_in: PermisoCreate) -> Any:
    """
    Crear un nuevo permiso.
    Solo accesible para superusuarios.
    """
    # Verificar si ya existe un permiso con ese nombre
    existing_permiso = crud.get_permiso_by_name(session=session, name=permiso_in.nombre)
    if existing_permiso:
        raise HTTPException(
            status_code=400,
            detail="Un permiso con este nombre ya existe en el sistema.",
        )

    permiso = crud.create_permiso(session=session, permiso_create=permiso_in)
    return permiso


@router.get(
    "/{permiso_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoPublic,
)
def read_permiso_by_id(permiso_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Obtener un permiso específico por ID.
    Solo accesible para superusuarios.
    """
    permiso = crud.get_permiso_by_id(session=session, permiso_id=permiso_id)
    if not permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )
    return permiso


@router.patch(
    "/{permiso_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PermisoPublic,
)
def update_permiso(
    *,
    session: SessionDep,
    permiso_id: uuid.UUID,
    permiso_in: PermisoUpdate,
) -> Any:
    """
    Actualizar un permiso.
    Solo accesible para superusuarios.
    """
    db_permiso = crud.get_permiso_by_id(session=session, permiso_id=permiso_id)
    if not db_permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )

    # Verificar que no exista otro permiso con el mismo nombre
    if permiso_in.nombre:
        existing_permiso = crud.get_permiso_by_name(session=session, name=permiso_in.nombre)
        if existing_permiso and existing_permiso.id != permiso_id:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro permiso con este nombre.",
            )

    permiso = crud.update_permiso(
        session=session, db_permiso=db_permiso, permiso_in=permiso_in
    )
    return permiso


@router.delete(
    "/{permiso_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_permiso(permiso_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Eliminar un permiso.
    Solo accesible para superusuarios.
    """
    deleted = crud.delete_permiso(session=session, permiso_id=permiso_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este ID no existe en el sistema.",
        )
    return Message(message="Permiso eliminado exitosamente")


@router.get("/name/{permiso_name}", response_model=PermisoPublic)
def read_permiso_by_name(
    permiso_name: str, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Obtener un permiso específico por nombre.
    Accesible para usuarios autenticados.
    """
    permiso = crud.get_permiso_by_name(session=session, name=permiso_name)
    if not permiso:
        raise HTTPException(
            status_code=404,
            detail="El permiso con este nombre no existe en el sistema.",
        )
    return permiso


@router.get("/me/check", response_model=dict)
def check_my_permissions(
    session: SessionDep, 
    current_user: CurrentUser,
    permissions: str = ""
) -> Any:
    """
    Verificar si el usuario actual tiene ciertos permisos.
    
    Query params:
        permissions: Lista de permisos separados por coma (ej: "rol.read,user.write")
    
    Returns:
        {
            "user_id": "uuid",
            "is_superuser": bool,
            "requested_permissions": ["rol.read", "user.write"],
            "has_all": bool,
            "permission_status": {
                "rol.read": true,
                "user.write": false
            }
        }
    """
    from app.routes.deps import check_user_permissions
    
    # Si no se especifican permisos, retornar todos los permisos del usuario
    if not permissions:
        user_permissions = crud.get_user_all_permissions(
            session=session, 
            user_id=current_user.id
        )
        return {
            "user_id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_superuser": current_user.is_superuser,
            "all_permissions": sorted(list(user_permissions)),
            "total_permissions": len(user_permissions)
        }
    
    # Parsear permisos solicitados
    requested_perms = [p.strip() for p in permissions.split(",") if p.strip()]
    
    # Verificar cada permiso
    permission_status = {}
    for perm in requested_perms:
        has_perm = check_user_permissions(
            session=session,
            user=current_user,
            required_permissions=[perm]
        )
        permission_status[perm] = has_perm
    
    # Verificar si tiene todos
    has_all = all(permission_status.values())
    
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "is_superuser": current_user.is_superuser,
        "requested_permissions": requested_perms,
        "has_all": has_all,
        "permission_status": permission_status
    }


@router.get("/user/{user_id}/permissions", response_model=dict)
def get_user_permissions(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Obtener todos los permisos de un usuario específico.
    
    Acceso:
    - Superusuarios: pueden ver permisos de cualquier usuario
    - Usuarios normales: solo pueden ver sus propios permisos
    """
    # Verificar permisos de acceso
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver los permisos de este usuario"
        )
    
    # Verificar que el usuario existe
    from models.auth.users import User
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    # Obtener permisos directos
    direct_permissions = crud.get_user_direct_permissions(
        session=session,
        user_id=user_id
    )
    
    # Obtener permisos por roles
    from app.routes.auth.roles.crud import get_user_roles
    user_roles = get_user_roles(session=session, user_id=user_id)
    
    role_permissions = {}
    for rol in user_roles:
        rol_perms = crud.get_rol_permissions_list(session=session, rol_id=rol.id)
        role_permissions[rol.nombre] = [p.nombre for p in rol_perms]
    
    # Obtener todos los permisos (combinados)
    all_permissions = crud.get_user_all_permissions(
        session=session,
        user_id=user_id
    )
    
    return {
        "user_id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "is_superuser": user.is_superuser,
        "direct_permissions": [p.nombre for p in direct_permissions],
        "roles": [{"nombre": rol.nombre, "id": str(rol.id)} for rol in user_roles],
        "permissions_by_role": role_permissions,
        "all_permissions": sorted(list(all_permissions)),
        "total_permissions": len(all_permissions)
    }
