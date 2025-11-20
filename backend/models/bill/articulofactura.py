import uuid
from sqlmodel import Field, SQLModel

class ArticuloFacturaBase(SQLModel):
    cantidad: int
    precio_unitario: float
    descuento: float = Field(default=0.0)
    impuesto: float
    subtotal: float
    total: float
    descripcion: str | None = None
    factura_id: uuid.UUID = Field(foreign_key="factura.id")
    producto_id: uuid.UUID = Field(foreign_key="producto.id")
    tasa_impositiva_id: uuid.UUID = Field(foreign_key="tasaimpositiva.id")

class ArticuloFacturaCreate(ArticuloFacturaBase):
    pass

class ArticuloFacturaUpdate(SQLModel):
    cantidad: int | None = None
    precio_unitario: float | None = None
    descuento: float | None = None
    impuesto: float | None = None
    subtotal: float | None = None
    total: float | None = None
    descripcion: str | None = None
    factura_id: uuid.UUID | None = None
    producto_id: uuid.UUID | None = None
    tasa_impositiva_id: uuid.UUID | None = None

class ArticuloFactura(ArticuloFacturaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ArticuloFacturaPublic(ArticuloFacturaBase):
    id: uuid.UUID

class ArticulosFacturaPublic(SQLModel):
    data: list[ArticuloFacturaPublic]
    count: int
