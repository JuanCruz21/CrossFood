import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class InvoiceCorrectionBase(SQLModel):
    original_invoice_id: uuid.UUID = Field(foreign_key="Invoices.id")
    corrective_invoice_id: uuid.UUID = Field(unique=True, foreign_key="Invoices.id")
    correction_reason_code: str | None = Field(default=None, max_length=10)
    correction_type: str = Field(max_length=20)  # substitution, difference
    reason_description: str | None = Field(default=None)
    corrected_base_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    corrected_tax_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)


# Properties to receive via API on creation
class InvoiceCorrectionCreate(InvoiceCorrectionBase):
    pass


# Properties to receive via API on update, all are optional
class InvoiceCorrectionUpdate(SQLModel):
    original_invoice_id: uuid.UUID | None = Field(default=None)
    corrective_invoice_id: uuid.UUID | None = Field(default=None)
    correction_reason_code: str | None = Field(default=None, max_length=10)
    correction_type: str | None = Field(default=None, max_length=20)
    reason_description: str | None = Field(default=None)
    corrected_base_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    corrected_tax_amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)


# Database model, database table inferred from class name
class InvoiceCorrection(InvoiceCorrectionBase, table=True):
    __tablename__ = "InvoiceCorrections"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))


# Properties to return via API, id is always required
class InvoiceCorrectionPublic(InvoiceCorrectionBase):
    id: uuid.UUID
    created_at: datetime | None


class InvoiceCorrectionsPublic(SQLModel):
    data: list[InvoiceCorrectionPublic]
    count: int
