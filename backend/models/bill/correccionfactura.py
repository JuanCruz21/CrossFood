import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class CorreccionFacturaBase(SQLModel):
    fecha_correccion: datetime = Field(default_factory=datetime.utcnow)
    motivo: str
    tipo_correccion: str  # anulacion, devolucion, ajuste, nota_credito, nota_debito
    monto_correccion: float
    descripcion: str | None = None
    factura_original_id: uuid.UUID = Field(foreign_key="factura.id")
    factura_correccion_id: uuid.UUID | None = Field(default=None, foreign_key="factura.id")
    realizado_por: uuid.UUID = Field(foreign_key="user.id")
    aprobado_por: uuid.UUID | None = Field(default=None, foreign_key="user.id")
    estado: str = Field(default="pendiente")  # pendiente, aprobada, rechazada

class CorreccionFacturaCreate(CorreccionFacturaBase):
    pass

class CorreccionFacturaUpdate(SQLModel):
    fecha_correccion: datetime | None = None
    motivo: str | None = None
    tipo_correccion: str | None = None
    monto_correccion: float | None = None
    descripcion: str | None = None
    factura_original_id: uuid.UUID | None = None
    factura_correccion_id: uuid.UUID | None = None
    realizado_por: uuid.UUID | None = None
    aprobado_por: uuid.UUID | None = None
    estado: str | None = None

class CorreccionFacturaEstadoUpdate(SQLModel):
    estado: str
    aprobado_por: uuid.UUID | None = None

class CorreccionFactura(CorreccionFacturaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class CorreccionFacturaPublic(CorreccionFacturaBase):
    id: uuid.UUID

class CorreccionesFacturaPublic(SQLModel):
    data: list[CorreccionFacturaPublic]
    count: int
