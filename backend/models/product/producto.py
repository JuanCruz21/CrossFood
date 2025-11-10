import uuid
from sqlmodel import Field, SQLModel

class ProductoBase(SQLModel):
    nombre: str = Field(index=True, unique=True)
    descripcion: str | None = None
    precio: float
    stock: int
    imagen: str | None = None
    empresa_id: uuid.UUID = Field(foreign_key="empresa.id")
    tasa_impositiva_id: uuid.UUID = Field(foreign_key="tasaimpositiva.id")
    restaurante_id: uuid.UUID  = Field(foreign_key="restaurante.id")
    categoria_id: uuid.UUID = Field(foreign_key="categoria.id")

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(SQLModel):
    nombre: str
    descripcion: str | None = None
    precio: float
    stock: int
    empresa_id: uuid.UUID | None = None
    categoria_id: uuid.UUID | None = None