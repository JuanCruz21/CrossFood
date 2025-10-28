import uuid
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class TaxRateBase(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    rate: Decimal = Field(max_digits=5, decimal_places=2)
    is_default: bool | None = Field(default=False)


# Properties to receive via API on creation
class TaxRateCreate(TaxRateBase):
    pass


# Properties to receive via API on update, all are optional
class TaxRateUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    rate: Decimal | None = Field(default=None, max_digits=5, decimal_places=2)
    is_default: bool | None = Field(default=None)


# Database model, database table inferred from class name
class TaxRate(TaxRateBase, table=True):
    __tablename__ = "TaxRates"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class TaxRatePublic(TaxRateBase):
    id: uuid.UUID


class TaxRatesPublic(SQLModel):
    data: list[TaxRatePublic]
    count: int
