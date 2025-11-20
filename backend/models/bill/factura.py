import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class FacturaBase(SQLModel):
    numero_factura: str = Field(index=True, unique=True)
    fecha: datetime = Field(default_factory=datetime.utcnow)
    subtotal: float
    impuestos: float
    total: float
    estado: str = Field(default="pendiente")  # pendiente, pagada, cancelada, anulada
    tipo_factura: str = Field(default="venta")  # venta, compra
    notas: str | None = None
    fecha_vencimiento: datetime | None = None
    orden_id: uuid.UUID | None = Field(default=None, foreign_key="orden.id")
    cliente_id: uuid.UUID = Field(foreign_key="user.id")
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")
    empresa_id: uuid.UUID | None = Field(default=None, foreign_key="empresa.id")

class FacturaCreate(FacturaBase):
    pass

class FacturaUpdate(SQLModel):
    numero_factura: str | None = None
    fecha: datetime | None = None
    subtotal: float | None = None
    impuestos: float | None = None
    total: float | None = None
    estado: str | None = None
    tipo_factura: str | None = None
    notas: str | None = None
    fecha_vencimiento: datetime | None = None
    orden_id: uuid.UUID | None = None
    cliente_id: uuid.UUID | None = None
    restaurante_id: uuid.UUID | None = None
    empresa_id: uuid.UUID | None = None

class FacturaEstadoUpdate(SQLModel):
    estado: str

class Factura(FacturaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class FacturaPublic(FacturaBase):
    id: uuid.UUID

class FacturasPublic(SQLModel):
    data: list[FacturaPublic]
    count: int
