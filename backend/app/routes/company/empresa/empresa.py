import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.routes.company.empresa import crud
from app.routes.deps import CurrentUser, SessionDep, get_current_active_superuser
from models.company.empresa import (
    Empresa,
    EmpresaCreate,
    EmpresaPublic,
    EmpresasPublic,
    EmpresaUpdate,
)
from models.config import Message

router = APIRouter(prefix="/empresas", tags=["empresas"])


@router.get(
    "/",
    response_model=EmpresasPublic,
)
def read_empresas(
    session: SessionDep, 
    current_user: CurrentUser,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Obtener empresas.
    - Superusuarios: ven todas las empresas
    - Usuarios normales: solo ven su propia empresa
    """
    if current_user.is_superuser:
        # Superadmin sees all
        count_statement = select(func.count()).select_from(Empresa)
        count = session.exec(count_statement).one()
        statement = select(Empresa).offset(skip).limit(limit)
        empresas = session.exec(statement).all()
    else:
        # Normal user sees only their empresa
        if not current_user.empresa_id:
            return EmpresasPublic(data=[], count=0)
        
        statement = select(Empresa).where(Empresa.id == current_user.empresa_id)
        empresas = session.exec(statement).all()
        count = len(empresas)
    
    empresas_public = [EmpresaPublic.model_validate(empresa) for empresa in empresas]
    return EmpresasPublic(data=empresas_public, count=count)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=EmpresaPublic,
)
def create_empresa(*, session: SessionDep, empresa_in: EmpresaCreate) -> Any:
    """
    Crear una nueva empresa.
    Solo accesible para superusuarios.
    """
    # Verificar que no exista una empresa con el mismo nombre
    empresa = crud.get_empresa_by_nombre(session=session, nombre=empresa_in.nombre)
    if empresa:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una empresa con este nombre en el sistema.",
        )

    empresa = crud.create_empresa(session=session, empresa_create=empresa_in)
    return empresa


@router.get(
    "/{empresa_id}",
    response_model=EmpresaPublic,
)
def read_empresa_by_id(
    empresa_id: uuid.UUID, 
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Obtener una empresa por su ID.
    - Superusuarios: pueden ver cualquier empresa
    - Usuarios normales: solo pueden ver su propia empresa
    """
    empresa = crud.get_empresa_by_id(session=session, empresa_id=empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="La empresa con este ID no existe en el sistema.",
        )
    
    # Check permissions
    if not current_user.is_superuser and current_user.empresa_id != empresa_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver esta empresa.",
        )
    
    return empresa


@router.patch(
    "/{empresa_id}",
    response_model=EmpresaPublic,
)
def update_empresa(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    empresa_id: uuid.UUID,
    empresa_in: EmpresaUpdate,
) -> Any:
    """
    Actualizar una empresa.
    - Superusuarios: pueden actualizar cualquier empresa
    - Usuarios normales: solo pueden actualizar su propia empresa
    """
    empresa = crud.get_empresa_by_id(session=session, empresa_id=empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="La empresa con este ID no existe en el sistema.",
        )
    
    # Check permissions
    if not current_user.is_superuser and current_user.empresa_id != empresa_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar esta empresa.",
        )

    # Si se está actualizando el nombre, verificar que no exista otra empresa con ese nombre
    if empresa_in.nombre and empresa_in.nombre != empresa.nombre:
        existing_empresa = crud.get_empresa_by_nombre(session=session, nombre=empresa_in.nombre)
        if existing_empresa:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otra empresa con este nombre en el sistema.",
            )

    empresa = crud.update_empresa(session=session, db_empresa=empresa, empresa_in=empresa_in)
    return empresa


@router.delete(
    "/{empresa_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_empresa(empresa_id: uuid.UUID, session: SessionDep) -> Any:
    """
    Eliminar una empresa.
    Solo accesible para superusuarios.
    """
    empresa = crud.get_empresa_by_id(session=session, empresa_id=empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="La empresa con este ID no existe en el sistema.",
        )

    # Verificar si hay restaurantes asociados a esta empresa
    from models.company.restaurante import Restaurante
    statement = select(Restaurante).where(Restaurante.empresa_id == empresa_id)
    restaurantes = session.exec(statement).all()
    if restaurantes:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar la empresa. Tiene {len(restaurantes)} restaurante(s) asociado(s).",
        )

    crud.delete_empresa(session=session, empresa_id=empresa_id)
    return Message(message="Empresa eliminada exitosamente")


@router.get("/nombre/{nombre}", response_model=EmpresaPublic)
def read_empresa_by_nombre(
    nombre: str, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Obtener una empresa por su nombre.
    """
    empresa = crud.get_empresa_by_nombre(session=session, nombre=nombre)
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="La empresa con este nombre no existe en el sistema.",
        )
    return empresa
