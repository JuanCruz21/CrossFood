import uuid
from sqlmodel import Field, SQLModel

class OrdenBase(SQLModel):
    fecha: str
    total: float
    cliente_id: uuid.UUID = Field(foreign_key="cliente.id")
    empresa_id: uuid.UUID = Field(foreign_key="empresa.id")

class OrdenCreate(OrdenBase):
    pass

class OrdenUpdate(SQLModel):
    fecha: str
    total: float
    cliente_id: uuid.UUID | None = None
    empresa_id: uuid.UUID | None = None

class Orden(OrdenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class OrdenPublic(OrdenBase):
    id: uuid.UUID

class OrdenesPublic(SQLModel):
    data: list[OrdenPublic]
    count: int