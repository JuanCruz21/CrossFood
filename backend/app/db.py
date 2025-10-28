import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.engine import URL
from sqlalchemy.engine.url import make_url
from sqlmodel import SQLModel
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

def _db_url():
    """
    Construye la URL de la base de datos a partir de una cadena de conexión completa
    o a partir de variables de entorno individuales.
    """
    raw = (os.getenv("DATABASE_CONNECTION") or os.getenv("DATABASE_URL") or "").strip().strip('"').strip("'")
    if raw:
        print("Usando DATABASE_CONNECTION o DATABASE_URL para la conexión a la base de datos")
        # Si se proporciona una URL completa, se usa directamente.
        # Nota: Si esta URL contiene `sslmode`, podría seguir fallando con asyncpg.
        # Es preferible usar las variables de entorno por separado.
        make_url(raw)  # Valida el formato
        return raw
    
    query_args = {}
    db_ssl_mode = os.getenv("DB_SSL_MODE", "disable")  # Ejemplo: "require"

    # Para asyncpg, usamos 'ssl' en lugar de 'sslmode'
    if db_ssl_mode and db_ssl_mode != "disable":
        if db_ssl_mode == "require":
            query_args["ssl"] = "require"
        elif db_ssl_mode == "prefer":
            query_args["ssl"] = "prefer"
        # Para 'disable' no agregamos nada ya que es el comportamiento por defecto
        
    return URL.create(
        drivername=os.getenv("DB_DRIVER", "postgresql+asyncpg"),
        username=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "db"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "app"),
        query=query_args  # Se pasan los argumentos extra como `ssl` aquí
    )
    # --- FIN DE LA CORRECCIÓN ---

DATABASE_URL = _db_url()
print("DATABASE_URL:", DATABASE_URL)
engine = create_async_engine(DATABASE_URL, echo=os.getenv("SQLALCHEMY_ECHO","false").lower()=="true")
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
