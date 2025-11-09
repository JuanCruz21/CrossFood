import uuid
from sqlmodel import Field, SQLModel

class categoriaBase(SQLModel):
    nombre: str = Field(index=True, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")

class CategoriaCreate(categoriaBase):
    pass

class CategoriaUpdate(SQLModel):
    nombre: str
    descripcion: str | None = None
    restaurante_id: uuid.UUID | None = None

class Categoria(categoriaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class CategoriaPublic(categoriaBase):
    id: uuid.UUID

class CategoriasPublic(SQLModel):
    data: list[CategoriaPublic]
    count: int