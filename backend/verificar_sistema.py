#!/usr/bin/env python3
"""
Script de verificación del sistema de roles y permisos.
Valida que todos los módulos se importen correctamente y que los endpoints estén registrados.
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))


def test_imports():
    """Verificar que todos los módulos se importen correctamente."""
    print("🔍 Verificando importaciones...")
    
    try:
        # Importar módulos CRUD
        from app.routes.auth.roles import crud as roles_crud
        from app.routes.auth.permisos import crud as permisos_crud
        print("  ✅ Módulos CRUD importados correctamente")
        
        # Importar routers
        from app.routes.auth.roles import roles, user_roles
        from app.routes.auth.permisos import permisos, role_permisos, user_permisos
        print("  ✅ Routers importados correctamente")
        
        # Importar helpers de permisos
        from app.routes.deps import require_permissions, require_any_permission, check_user_permissions
        print("  ✅ Helpers de permisos importados correctamente")
        
        return True
    except Exception as e:
        print(f"  ❌ Error en importaciones: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_routes():
    """Verificar que todos los endpoints estén registrados."""
    print("\n🔍 Verificando rutas registradas...")
    
    try:
        from app.main import app
        
        # Obtener todas las rutas
        routes = []
        for route in app.routes:
            if hasattr(route, 'path') and hasattr(route, 'methods'):
                methods = ', '.join(route.methods) if route.methods else 'N/A'
                routes.append((route.path, methods))
        
        # Rutas esperadas de roles y permisos
        expected_routes = [
            '/api/v1/roles/',
            '/api/v1/roles/{rol_id}',
            '/api/v1/roles/name/{rol_name}',
            '/api/v1/user-roles/assign',
            '/api/v1/user-roles/remove',
            '/api/v1/user-roles/user/{user_id}/roles',
            '/api/v1/user-roles/me/roles',
            '/api/v1/user-roles/rol/{rol_id}/users',
            '/api/v1/permisos/',
            '/api/v1/permisos/{permiso_id}',
            '/api/v1/permisos/name/{permiso_name}',
            '/api/v1/role-permisos/assign',
            '/api/v1/role-permisos/remove',
            '/api/v1/role-permisos/rol/{rol_id}/permisos',
            '/api/v1/user-permisos/assign',
            '/api/v1/user-permisos/remove',
            '/api/v1/user-permisos/user/{user_id}/permisos/direct',
            '/api/v1/user-permisos/user/{user_id}/permisos/all',
            '/api/v1/user-permisos/me/permisos',
            '/api/v1/user-permisos/me/permisos/direct',
        ]
        
        routes_paths = [r[0] for r in routes]
        missing = []
        for expected in expected_routes:
            if expected not in routes_paths:
                missing.append(expected)
        
        if missing:
            print(f"  ⚠️  Rutas faltantes: {len(missing)}")
            for route in missing:
                print(f"    - {route}")
            return False
        else:
            print(f"  ✅ Todas las rutas esperadas están registradas ({len(expected_routes)} rutas)")
            return True
            
    except Exception as e:
        print(f"  ❌ Error verificando rutas: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_crud_functions():
    """Verificar que todas las funciones CRUD existan."""
    print("\n🔍 Verificando funciones CRUD...")
    
    try:
        from app.routes.auth.roles import crud as roles_crud
        from app.routes.auth.permisos import crud as permisos_crud
        
        # Funciones esperadas en roles.crud
        roles_functions = [
            'create_rol', 'update_rol', 'get_rol_by_name', 'get_rol_by_id',
            'delete_rol', 'assign_rol_to_user', 'remove_rol_from_user',
            'get_user_roles', 'get_users_with_rol', 'get_rol_permissions'
        ]
        
        # Funciones esperadas en permisos.crud
        permisos_functions = [
            'create_permiso', 'update_permiso', 'get_permiso_by_name', 'get_permiso_by_id',
            'delete_permiso', 'assign_permiso_to_rol', 'remove_permiso_from_rol',
            'assign_permiso_to_user', 'remove_permiso_from_user',
            'get_user_direct_permissions', 'get_user_all_permissions', 'get_rol_permissions_list'
        ]
        
        # Verificar funciones de roles
        missing_roles = []
        for func_name in roles_functions:
            if not hasattr(roles_crud, func_name):
                missing_roles.append(func_name)
        
        # Verificar funciones de permisos
        missing_permisos = []
        for func_name in permisos_functions:
            if not hasattr(permisos_crud, func_name):
                missing_permisos.append(func_name)
        
        if missing_roles or missing_permisos:
            if missing_roles:
                print(f"  ⚠️  Funciones faltantes en roles.crud: {missing_roles}")
            if missing_permisos:
                print(f"  ⚠️  Funciones faltantes en permisos.crud: {missing_permisos}")
            return False
        else:
            print(f"  ✅ Todas las funciones CRUD están implementadas")
            print(f"    - Roles: {len(roles_functions)} funciones")
            print(f"    - Permisos: {len(permisos_functions)} funciones")
            return True
            
    except Exception as e:
        print(f"  ❌ Error verificando funciones CRUD: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Ejecutar todas las verificaciones."""
    print("=" * 60)
    print("🚀 VERIFICACIÓN DEL SISTEMA DE ROLES Y PERMISOS")
    print("=" * 60)
    
    results = []
    
    # Test 1: Importaciones
    results.append(test_imports())
    
    # Test 2: Rutas
    results.append(test_routes())
    
    # Test 3: Funciones CRUD
    results.append(test_crud_functions())
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("=" * 60)
    
    if all(results):
        print("✅ Todas las verificaciones pasaron exitosamente!")
        print("\n🎉 El sistema de roles y permisos está correctamente implementado")
        print("\n📝 Próximos pasos:")
        print("  1. Ejecutar: python init_roles_permisos.py")
        print("  2. Iniciar el servidor: uvicorn app.main:app --reload")
        print("  3. Visitar: http://localhost:8000/docs")
        return 0
    else:
        print("❌ Algunas verificaciones fallaron")
        print("\n🔧 Por favor, revisa los errores anteriores")
        return 1


if __name__ == "__main__":
    sys.exit(main())
