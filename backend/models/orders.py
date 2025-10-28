import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class OrderBase(SQLModel):
    restaurant_table_id: uuid.UUID | None = Field(default=None, foreign_key="RestaurantTables.id")
    status: str = Field(max_length=50)  # pending, confirmed, in_preparation, served, awaiting_payment, completed, cancelled


# Properties to receive via API on creation
class OrderCreate(OrderBase):
    pass


# Properties to receive via API on update, all are optional
class OrderUpdate(SQLModel):
    restaurant_table_id: uuid.UUID | None = Field(default=None)
    status: str | None = Field(default=None, max_length=50)


# Database model, database table inferred from class name
class Order(OrderBase, table=True):
    __tablename__ = "Orders"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))


# Properties to return via API, id is always required
class OrderPublic(OrderBase):
    id: uuid.UUID
    created_at: datetime | None
    updated_at: datetime | None


class OrdersPublic(SQLModel):
    data: list[OrderPublic]
    count: int
