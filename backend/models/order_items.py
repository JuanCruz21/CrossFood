import uuid
from typing import TYPE_CHECKING
from decimal import Decimal

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class OrderItemBase(SQLModel):
    order_id: uuid.UUID = Field(foreign_key="Orders.id")
    product_id: uuid.UUID = Field(foreign_key="Products.id")
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(max_digits=10, decimal_places=2)
    notes: str | None = Field(default=None)


# Properties to receive via API on creation
class OrderItemCreate(OrderItemBase):
    pass


# Properties to receive via API on update, all are optional
class OrderItemUpdate(SQLModel):
    order_id: uuid.UUID | None = Field(default=None)
    product_id: uuid.UUID | None = Field(default=None)
    quantity: int | None = Field(default=None, ge=1)
    unit_price: Decimal | None = Field(default=None, max_digits=10, decimal_places=2)
    notes: str | None = Field(default=None)


# Database model, database table inferred from class name
class OrderItem(OrderItemBase, table=True):
    __tablename__ = "OrderItems"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class OrderItemPublic(OrderItemBase):
    id: uuid.UUID


class OrderItemsPublic(SQLModel):
    data: list[OrderItemPublic]
    count: int
