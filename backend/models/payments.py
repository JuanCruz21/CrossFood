import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class PaymentBase(SQLModel):
    order_id: uuid.UUID = Field(foreign_key="Orders.id")
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    payment_method: str = Field(max_length=50)  # cash, card, online
    transaction_id: str | None = Field(default=None, max_length=255)
    status: str = Field(max_length=50)  # succeeded, failed, pending


# Properties to receive via API on creation
class PaymentCreate(PaymentBase):
    pass


# Properties to receive via API on update, all are optional
class PaymentUpdate(SQLModel):
    order_id: uuid.UUID | None = Field(default=None)
    amount: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    payment_method: str | None = Field(default=None, max_length=50)
    transaction_id: str | None = Field(default=None, max_length=255)
    status: str | None = Field(default=None, max_length=50)


# Database model, database table inferred from class name
class Payment(PaymentBase, table=True):
    __tablename__ = "Payments"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    payment_date: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))


# Properties to return via API, id is always required
class PaymentPublic(PaymentBase):
    id: uuid.UUID
    payment_date: datetime | None


class PaymentsPublic(SQLModel):
    data: list[PaymentPublic]
    count: int
