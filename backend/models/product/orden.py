import uuid
from sqlmodel import Field, SQLModel

class OrdenBase(SQLModel):
    fecha: str
    total: float
    estado: str = Field(default="pendiente")
    numero_comensales: int | None = None
    mesa_id: uuid.UUID | None = Field(foreign_key="mesarestaurante.id")
    cliente_id: uuid.UUID = Field(foreign_key="user.id")
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")

class OrdenCreate(OrdenBase):
    pass

class OrdenUpdate(SQLModel):
    fecha: str
    total: float
    estado: str | None = None
    mesa_id: uuid.UUID | None = None
    cliente_id: uuid.UUID | None = None
    restaurante_id: uuid.UUID | None = None

class OrdenEstadoUpdate(SQLModel):
    estado: str

class Orden(OrdenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class OrdenPublic(OrdenBase):
    id: uuid.UUID

class OrdenesPublic(SQLModel):
    data: list[OrdenPublic]
    count: int