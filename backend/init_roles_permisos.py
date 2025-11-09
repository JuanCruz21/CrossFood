"""
Script de inicialización de roles y permisos por defecto.
Ejecutar después de las migraciones para crear roles y permisos básicos del sistema.

Uso:
    python init_roles_permisos.py
"""

import asyncio
from sqlmodel import Session, select

from core.db import engine
from models.auth.rol import Rol, RolCreate
from models.auth.permiso import Permiso, PermisoCreate
from app.routes.auth.roles.crud import create_rol, get_rol_by_name
from app.routes.auth.permisos.crud import (
    create_permiso,
    get_permiso_by_name,
    assign_permiso_to_rol,
)


# Definir permisos del sistema
SYSTEM_PERMISSIONS = [
    {"name": "view_users", "description": "Ver listado de usuarios"},
    {"name": "create_users", "description": "Crear nuevos usuarios"},
    {"name": "edit_users", "description": "Editar usuarios existentes"},
    {"name": "delete_users", "description": "Eliminar usuarios"},
    {"name": "manage_roles", "description": "Gestionar roles del sistema"},
    {"name": "manage_permissions", "description": "Gestionar permisos del sistema"},
    {"name": "view_reports", "description": "Ver reportes del sistema"},
    {"name": "edit_products", "description": "Editar productos"},
    {"name": "delete_products", "description": "Eliminar productos"},
    {"name": "manage_orders", "description": "Gestionar órdenes"},
    {"name": "view_financial", "description": "Ver información financiera"},
    {"name": "manage_restaurant", "description": "Gestionar configuración del restaurante"},
]

# Definir roles del sistema
SYSTEM_ROLES = [
    {
        "name": "admin",
        "description": "Administrador con acceso completo",
        "permissions": [
            "view_users",
            "create_users",
            "edit_users",
            "delete_users",
            "manage_roles",
            "manage_permissions",
            "view_reports",
            "edit_products",
            "delete_products",
            "manage_orders",
            "view_financial",
            "manage_restaurant",
        ],
    },
    {
        "name": "manager",
        "description": "Gerente del restaurante",
        "permissions": [
            "view_users",
            "create_users",
            "edit_users",
            "view_reports",
            "edit_products",
            "manage_orders",
            "view_financial",
            "manage_restaurant",
        ],
    },
    {
        "name": "waiter",
        "description": "Mesero/Camarero",
        "permissions": [
            "manage_orders",
            "view_users",
        ],
    },
    {
        "name": "cashier",
        "description": "Cajero",
        "permissions": [
            "manage_orders",
            "view_financial",
        ],
    },
    {
        "name": "chef",
        "description": "Chef/Cocinero",
        "permissions": [
            "manage_orders",
            "edit_products",
        ],
    },
]


def init_roles_and_permissions():
    """Inicializar roles y permisos en la base de datos."""
    print("🚀 Iniciando creación de roles y permisos del sistema...")

    with Session(engine) as session:
        # 1. Crear permisos
        print("\n📝 Creando permisos...")
        created_permissions = {}
        for perm_data in SYSTEM_PERMISSIONS:
            existing = get_permiso_by_name(session=session, name=perm_data["name"])
            if existing:
                print(f"   ⏭️  Permiso '{perm_data['name']}' ya existe, omitiendo...")
                created_permissions[perm_data["name"]] = existing
            else:
                permiso = create_permiso(
                    session=session,
                    permiso_create=PermisoCreate(
                        name=perm_data["name"], description=perm_data["description"]
                    ),
                )
                created_permissions[perm_data["name"]] = permiso
                print(f"   ✅ Permiso '{perm_data['name']}' creado")

        # 2. Crear roles
        print("\n👥 Creando roles...")
        for role_data in SYSTEM_ROLES:
            existing_role = get_rol_by_name(session=session, name=role_data["name"])
            if existing_role:
                print(f"   ⏭️  Rol '{role_data['name']}' ya existe, omitiendo...")
                current_rol = existing_role
            else:
                current_rol = create_rol(
                    session=session,
                    rol_create=RolCreate(
                        name=role_data["name"], description=role_data["description"]
                    ),
                )
                print(f"   ✅ Rol '{role_data['name']}' creado")

            # 3. Asignar permisos al rol
            print(f"   🔗 Asignando permisos al rol '{role_data['name']}'...")
            for perm_name in role_data["permissions"]:
                if perm_name in created_permissions:
                    # Usar el primer superusuario como assigned_by
                    # En producción, esto debería ser más robusto
                    from models.auth.users import User

                    superuser = session.exec(
                        select(User).where(User.is_superuser == True)
                    ).first()

                    if not superuser:
                        print(
                            "      ⚠️  Advertencia: No se encontró superusuario. "
                            "Crea un superusuario primero."
                        )
                        continue

                    try:
                        assign_permiso_to_rol(
                            session=session,
                            permiso_id=created_permissions[perm_name].id,
                            rol_id=current_rol.id,
                            assigned_by=superuser.id,
                        )
                        print(f"      ✓ Permiso '{perm_name}' asignado")
                    except Exception as e:
                        print(f"      ⚠️  Error al asignar '{perm_name}': {str(e)}")

    print("\n✨ ¡Roles y permisos inicializados correctamente!")
    print("\n📋 Resumen:")
    print(f"   - {len(SYSTEM_PERMISSIONS)} permisos creados")
    print(f"   - {len(SYSTEM_ROLES)} roles creados")
    print("\n💡 Puedes asignar estos roles a usuarios usando los endpoints del API:")
    print("   POST /api/v1/user-roles/assign")


if __name__ == "__main__":
    try:
        init_roles_and_permissions()
    except Exception as e:
        print(f"\n❌ Error durante la inicialización: {str(e)}")
        import traceback

        traceback.print_exc()
