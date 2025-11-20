import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class PagoBase(SQLModel):
    monto: float
    fecha_pago: datetime = Field(default_factory=datetime.utcnow)
    metodo_pago: str  # efectivo, tarjeta_credito, tarjeta_debito, transferencia, otro
    referencia: str | None = None
    notas: str | None = None
    estado: str = Field(default="completado")  # completado, pendiente, fallido, reembolsado
    factura_id: uuid.UUID = Field(foreign_key="factura.id")
    procesado_por: uuid.UUID | None = Field(default=None, foreign_key="user.id")

class PagoCreate(PagoBase):
    pass

class PagoUpdate(SQLModel):
    monto: float | None = None
    fecha_pago: datetime | None = None
    metodo_pago: str | None = None
    referencia: str | None = None
    notas: str | None = None
    estado: str | None = None
    factura_id: uuid.UUID | None = None
    procesado_por: uuid.UUID | None = None

class PagoEstadoUpdate(SQLModel):
    estado: str

class Pago(PagoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class PagoPublic(PagoBase):
    id: uuid.UUID

class PagosPublic(SQLModel):
    data: list[PagoPublic]
    count: int
