import uuid
from sqlmodel import Field, SQLModel
from pydantic import field_validator

class categoriaBase(SQLModel):
    nombre: str = Field(index=True, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")
    categoria_id: uuid.UUID | None = Field(default=None, foreign_key="categoria.id")

    @field_validator("categoria_id", mode="before")
    def _empty_categoria_id_to_none(cls, v):
        # Convert empty string from client to None so UUID parsing doesn't fail
        if v == "":
            return None
        return v

class CategoriaCreate(categoriaBase):
    pass

class CategoriaUpdate(SQLModel):
    nombre: str
    descripcion: str | None = None
    restaurante_id: uuid.UUID | None = None
    categoria_id: uuid.UUID | None = None

class Categoria(categoriaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class CategoriaPublic(categoriaBase):
    id: uuid.UUID

class CategoriasPublic(SQLModel):
    data: list[CategoriaPublic]
    count: int