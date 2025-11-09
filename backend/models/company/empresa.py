import uuid

from sqlmodel import Field, SQLModel

class EmpresaBase(SQLModel):
    nombre: str = Field(index=True, unique=True)
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(SQLModel):
    nombre: str
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None

class Empresa(EmpresaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class EmpresaPublic(EmpresaBase):
    id: uuid.UUID

class EmpresasPublic(SQLModel):
    data: list[EmpresaPublic]
    count: int