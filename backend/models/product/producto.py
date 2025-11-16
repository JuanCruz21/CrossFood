import uuid
from sqlmodel import Field, SQLModel
from pydantic import field_validator

class ProductoBase(SQLModel):
    nombre: str = Field(index=True, unique=True)
    descripcion: str | None = None
    precio: float
    stock: int
    imagen: str | None = None
    empresa_id: uuid.UUID | None = Field(default=None, foreign_key="empresa.id")
    tasa_impositiva_id: uuid.UUID = Field(foreign_key="tasaimpositiva.id")
    restaurante_id: uuid.UUID | None = Field(default=None, foreign_key="restaurante.id")
    categoria_id: uuid.UUID = Field(foreign_key="categoria.id")

    @field_validator("empresa_id", mode="before")
    def _empty_empresa_id_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("restaurante_id", mode="before")
    def _empty_restaurante_id_to_none(cls, v):
        if v == "":
            return None
        return v

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(SQLModel):
    nombre: str
    descripcion: str | None = None
    precio: float
    stock: int
    empresa_id: uuid.UUID | None = None
    restaurante_id: uuid.UUID | None = None
    tasa_impositiva_id: uuid.UUID | None = None
    categoria_id: uuid.UUID | None = None

class Producto(ProductoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ProductoPublic(ProductoBase):
    id: uuid.UUID

class ProductosPublic(SQLModel):
    data: list[ProductoPublic]
    count: int