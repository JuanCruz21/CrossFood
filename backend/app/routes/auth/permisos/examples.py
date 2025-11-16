"""
Ejemplos de Uso del Sistema de Permisos

Este archivo muestra cómo implementar control de permisos en los endpoints de FastAPI.
"""

from fastapi import APIRouter, Depends
from app.routes.deps import require_permissions, require_any_permission, SessionDep, CurrentUser
from app.routes.auth.permisos.permissions import (
    ROL_READ, ROL_WRITE, ROL_DELETE,
    USER_READ, USER_WRITE,
    RESTAURANTE_READ, RESTAURANTE_WRITE
)

router = APIRouter()

# ============================================
# Ejemplo 1: Requiere UN permiso específico
# ============================================

@router.get("/roles")
def list_roles(
    session: SessionDep,
    current_user: CurrentUser = Depends(require_permissions(ROL_READ))
):
    """
    Listar roles.
    Requiere permiso: rol.read
    """
    # El usuario ya fue validado por require_permissions
    # current_user tiene el permiso rol.read (directamente o por rol)
    return {"message": "Lista de roles"}


# ============================================
# Ejemplo 2: Requiere MÚLTIPLES permisos
# ============================================

@router.post("/roles")
def create_role(
    session: SessionDep,
    current_user: CurrentUser = Depends(require_permissions(ROL_WRITE, ROL_READ))
):
    """
    Crear un rol.
    Requiere permisos: rol.write Y rol.read
    """
    # El usuario debe tener AMBOS permisos
    return {"message": "Rol creado"}


# ============================================
# Ejemplo 3: Requiere AL MENOS UNO de varios permisos
# ============================================

@router.get("/dashboard")
def view_dashboard(
    session: SessionDep,
    current_user: CurrentUser = Depends(require_any_permission(
        USER_READ, ROL_READ, RESTAURANTE_READ
    ))
):
    """
    Ver dashboard.
    Requiere AL MENOS UNO de: user.read O rol.read O restaurante.read
    """
    # El usuario tiene al menos uno de los permisos listados
    return {"message": "Dashboard data"}


# ============================================
# Ejemplo 4: Validación manual de permisos
# ============================================

@router.get("/custom-logic")
def custom_permission_logic(
    session: SessionDep,
    current_user: CurrentUser
):
    """
    Endpoint con lógica de permisos personalizada.
    """
    from app.routes.deps import check_user_permissions
    
    # Verificación manual de permisos
    has_write = check_user_permissions(
        session=session,
        user=current_user,
        required_permissions=[USER_WRITE]
    )
    
    has_read = check_user_permissions(
        session=session,
        user=current_user,
        required_permissions=[USER_READ]
    )
    
    if has_write:
        return {"message": "Usuario con permisos de escritura", "level": "write"}
    elif has_read:
        return {"message": "Usuario con permisos de lectura", "level": "read"}
    else:
        return {"message": "Usuario sin permisos especiales", "level": "none"}


# ============================================
# Ejemplo 5: Combinando con otras dependencias
# ============================================

@router.delete("/roles/{role_id}")
def delete_role(
    role_id: str,
    session: SessionDep,
    current_user: CurrentUser = Depends(require_permissions(ROL_DELETE))
):
    """
    Eliminar un rol.
    Requiere permiso: rol.delete
    """
    # Superusuarios pasan automáticamente
    # Usuarios normales necesitan el permiso rol.delete (directo o por rol)
    return {"message": f"Rol {role_id} eliminado"}


# ============================================
# Ejemplo 6: Endpoint sin restricciones de permisos
# ============================================

@router.get("/public-info")
def public_info(current_user: CurrentUser):
    """
    Endpoint público (solo requiere estar autenticado).
    No requiere permisos específicos.
    """
    return {"message": "Información pública"}


# ============================================
# RESUMEN DE USO
# ============================================

"""
1. DEPENDENCIAS DISPONIBLES:

   a) require_permissions(*permisos)
      - El usuario debe tener TODOS los permisos listados
      - Uso: Depends(require_permissions("permiso1", "permiso2"))
      
   b) require_any_permission(*permisos)
      - El usuario debe tener AL MENOS UNO de los permisos
      - Uso: Depends(require_any_permission("permiso1", "permiso2"))
      
   c) check_user_permissions(session, user, required_permissions)
      - Función auxiliar para validación manual
      - Retorna: bool

2. SUPERUSUARIOS:
   - Los superusuarios (is_superuser=True) tienen TODOS los permisos automáticamente
   - No necesitan tener permisos asignados explícitamente

3. HERENCIA DE PERMISOS:
   - Los permisos pueden estar asignados directamente al usuario
   - O heredados a través de los roles del usuario
   - El sistema verifica ambas fuentes automáticamente

4. FORMATO DE PERMISOS:
   - Formato: recurso.accion
   - Ejemplos: 
     * "rol.read" - Leer roles
     * "user.write" - Escribir/modificar usuarios
     * "restaurante.delete" - Eliminar restaurantes

5. MEJORES PRÁCTICAS:
   - Usar constantes del archivo permissions.py
   - Definir permisos granulares (read, write, delete)
   - Agrupar permisos relacionados en roles
   - Documentar qué permisos requiere cada endpoint

6. EJEMPLO DE FLUJO COMPLETO:
   
   # 1. Crear el permiso en la base de datos
   POST /api/v1/permisos/
   {
       "nombre": "rol.read",
       "descripcion": "Leer y listar roles"
   }
   
   # 2. Asignar el permiso a un rol
   POST /api/v1/permisos/rol/{rol_id}
   {
       "permiso_id": "uuid-del-permiso"
   }
   
   # 3. Asignar el rol al usuario
   POST /api/v1/roles/user/{user_id}
   {
       "rol_id": "uuid-del-rol"
   }
   
   # 4. El usuario ahora puede acceder a endpoints protegidos con rol.read
   GET /api/v1/roles/  # ✓ Acceso permitido
"""
