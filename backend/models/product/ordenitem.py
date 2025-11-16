import uuid
from sqlmodel import Field, SQLModel

class OrdenItemBase(SQLModel):
    orden_id: uuid.UUID = Field(foreign_key="orden.id", primary_key=True)
    producto_id: uuid.UUID = Field(foreign_key="producto.id", primary_key=True)
    cantidad: int
    precio_unitario: float
    notas: str

class OrdenItemCreate(OrdenItemBase):
    pass

class OrdenItemUpdate(SQLModel):
    cantidad: int | None = None
    precio_unitario: float | None = None
    notas: str | None = None

class OrdenItem(OrdenItemBase, table=True):
    id : uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class OrdenItemPublic(OrdenItemBase):
    id: uuid.UUID

class OrdenItemsPublic(SQLModel):
    data: list[OrdenItemPublic]
    count: int