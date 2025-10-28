import uuid
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel, Index


# Shared properties
class InvoiceBase(SQLModel):
    company_id: uuid.UUID = Field(foreign_key="Companies.id")
    payment_id: uuid.UUID | None = Field(default=None, foreign_key="Payments.id")
    invoice_series: str = Field(max_length=20)
    invoice_number: int
    issue_date: date
    operation_date: date
    invoice_type: str = Field(max_length=20)  # simplified, full
    customer_name: str | None = Field(default=None, max_length=255)
    customer_tax_id: str | None = Field(default=None, max_length=20)
    customer_address: str | None = Field(default=None)
    customer_city: str | None = Field(default=None, max_length=100)
    customer_postal_code: str | None = Field(default=None, max_length=10)
    customer_country: str | None = Field(default=None, max_length=50)
    total_base_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    total_tax_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    total_amount: Decimal = Field(max_digits=10, decimal_places=2)
    verifactu_hash: str | None = Field(default=None, max_length=255)
    qr_code_data: str | None = Field(default=None)


# Properties to receive via API on creation
class InvoiceCreate(InvoiceBase):
    pass


# Properties to receive via API on update, all are optional
class InvoiceUpdate(SQLModel):
    company_id: uuid.UUID | None = Field(default=None)
    payment_id: uuid.UUID | None = Field(default=None)
    invoice_series: str | None = Field(default=None, max_length=20)
    invoice_number: int | None = Field(default=None)
    issue_date: date | None = Field(default=None)
    operation_date: date | None = Field(default=None)
    invoice_type: str | None = Field(default=None, max_length=20)
    customer_name: str | None = Field(default=None, max_length=255)
    customer_tax_id: str | None = Field(default=None, max_length=20)
    customer_address: str | None = Field(default=None)
    customer_city: str | None = Field(default=None, max_length=100)
    customer_postal_code: str | None = Field(default=None, max_length=10)
    customer_country: str | None = Field(default=None, max_length=50)
    total_base_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    total_tax_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    total_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    verifactu_hash: str | None = Field(default=None, max_length=255)
    qr_code_data: str | None = Field(default=None)


# Database model, database table inferred from class name
class Invoice(InvoiceBase, table=True):
    __tablename__ = "Invoices"
    __table_args__ = (
        Index('idx_invoice_series_number', 'invoice_series', 'invoice_number', unique=True),
    )
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))


# Properties to return via API, id is always required
class InvoicePublic(InvoiceBase):
    id: uuid.UUID
    created_at: datetime | None


class InvoicesPublic(SQLModel):
    data: list[InvoicePublic]
    count: int
