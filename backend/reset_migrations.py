"""
Script para limpiar la tabla alembic_version y empezar de cero
Ejecutar con: uv run python reset_migrations.py
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

database_url = os.getenv("DATABASE_ALEMBIC")
if not database_url:
    raise RuntimeError("DATABASE_ALEMBIC no está definido en el archivo .env")

engine = create_engine(database_url)

print("🔍 Verificando estado actual de migraciones...")
with engine.connect() as conn:
    try:
        result = conn.execute(text("SELECT version_num FROM alembic_version"))
        versions = [row[0] for row in result]
        print(f"📋 Versiones actuales en la base de datos: {versions}")
    except Exception as e:
        print(f"⚠️  No se pudo leer alembic_version: {e}")
        versions = []

if versions:
    print("\n🗑️  Limpiando tabla alembic_version...")
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM alembic_version"))
    print("✅ Tabla alembic_version limpiada exitosamente")
else:
    print("✅ No hay versiones para limpiar")

print("\n📝 Ahora puedes ejecutar:")
print("   uv run alembic revision --autogenerate -m 'Initial migration with all models'")
print("   uv run alembic upgrade head")
