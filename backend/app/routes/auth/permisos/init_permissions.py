"""
Script para inicializar permisos básicos en la base de datos.

Ejecutar con:
    python -m app.routes.auth.permisos.init_permissions
"""

import asyncio
from sqlmodel import Session, select

from core.db import engine
from models.auth.permiso import Permiso, PermisoCreate
from app.routes.auth.permisos.permissions import get_all_permissions, get_permission_description


def init_permissions():
    """
    Crear todos los permisos definidos en permissions.py si no existen.
    """
    with Session(engine) as session:
        all_permissions = get_all_permissions()
        created_count = 0
        skipped_count = 0
        
        print(f"\n{'='*60}")
        print(f"Inicializando {len(all_permissions)} permisos...")
        print(f"{'='*60}\n")
        
        for permission_name in all_permissions:
            # Verificar si ya existe
            statement = select(Permiso).where(Permiso.nombre == permission_name)
            existing = session.exec(statement).first()
            
            if existing:
                print(f"⏭️  Ya existe: {permission_name}")
                skipped_count += 1
                continue
            
            # Crear el permiso
            description = get_permission_description(permission_name)
            permiso_data = PermisoCreate(
                nombre=permission_name,
                descripcion=description
            )
            
            permiso = Permiso.model_validate(permiso_data)
            session.add(permiso)
            print(f"✅ Creado: {permission_name} - {description}")
            created_count += 1
        
        # Commit todos los cambios
        session.commit()
        
        print(f"\n{'='*60}")
        print(f"Resumen:")
        print(f"  ✅ Permisos creados: {created_count}")
        print(f"  ⏭️  Permisos existentes: {skipped_count}")
        print(f"  📊 Total: {len(all_permissions)}")
        print(f"{'='*60}\n")


if __name__ == "__main__":
    print("\n🔐 Inicializador de Permisos - CrossFood\n")
    try:
        init_permissions()
        print("✅ Inicialización completada exitosamente!\n")
    except Exception as e:
        print(f"\n❌ Error durante la inicialización: {str(e)}\n")
        raise
