import uuid
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class InvoiceItemBase(SQLModel):
    invoice_id: uuid.UUID = Field(foreign_key="Invoices.id")
    product_description: str | None = Field(default=None, max_length=255)
    quantity: int = Field(ge=1)
    unit_price_base: Decimal = Field(max_digits=10, decimal_places=2)
    discount_percentage: Decimal | None = Field(default=None, max_digits=5, decimal_places=2)
    tax_rate_percentage: Decimal | None = Field(default=None, max_digits=5, decimal_places=2)
    tax_amount: Decimal = Field(max_digits=10, decimal_places=2)
    total_line_amount: Decimal = Field(max_digits=10, decimal_places=2)


# Properties to receive via API on creation
class InvoiceItemCreate(InvoiceItemBase):
    pass


# Properties to receive via API on update, all are optional
class InvoiceItemUpdate(SQLModel):
    invoice_id: uuid.UUID | None = Field(default=None)
    product_description: str | None = Field(default=None, max_length=255)
    quantity: int | None = Field(default=None, ge=1)
    unit_price_base: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    discount_percentage: Decimal | None = Field(default=None, max_digits=5, decimal_places=2)
    tax_rate_percentage: Decimal | None = Field(default=None, max_digits=5, decimal_places=2)
    tax_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    total_line_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)


# Database model, database table inferred from class name
class InvoiceItem(InvoiceItemBase, table=True):
    __tablename__ = "InvoiceItems"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class InvoiceItemPublic(InvoiceItemBase):
    id: uuid.UUID


class InvoiceItemsPublic(SQLModel):
    data: list[InvoiceItemPublic]
    count: int
