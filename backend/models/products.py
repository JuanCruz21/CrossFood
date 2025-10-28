import uuid
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class ProductBase(SQLModel):
    category_id: uuid.UUID = Field(foreign_key="Categories.id")
    tax_rate_id: uuid.UUID | None = Field(default=None, foreign_key="TaxRates.id")
    name: str = Field(max_length=255)
    description: str | None = Field(default=None)
    price: Decimal = Field(max_digits=10, decimal_places=2)
    is_available: bool | None = Field(default=True)


# Properties to receive via API on creation
class ProductCreate(ProductBase):
    pass


# Properties to receive via API on update, all are optional
class ProductUpdate(SQLModel):
    category_id: uuid.UUID | None = Field(default=None)
    tax_rate_id: uuid.UUID | None = Field(default=None)
    name: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None)
    price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    is_available: bool | None = Field(default=None)


# Database model, database table inferred from class name
class Product(ProductBase, table=True):
    __tablename__ = "Products"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class ProductPublic(ProductBase):
    id: uuid.UUID


class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int
