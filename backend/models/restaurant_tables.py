import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class RestaurantTableBase(SQLModel):
    restaurant_id: uuid.UUID | None = Field(default=None, foreign_key="Restaurants.id")
    table_number: str = Field(max_length=10)
    qr_code_identifier: str | None = Field(default=None, max_length=255)
    status: str = Field(max_length=50)  # available, occupied, reserved


# Properties to receive via API on creation
class RestaurantTableCreate(RestaurantTableBase):
    pass


# Properties to receive via API on update, all are optional
class RestaurantTableUpdate(SQLModel):
    restaurant_id: uuid.UUID | None = Field(default=None)
    table_number: str | None = Field(default=None, max_length=10)
    qr_code_identifier: str | None = Field(default=None, max_length=255)
    status: str | None = Field(default=None, max_length=50)


# Database model, database table inferred from class name
class RestaurantTable(RestaurantTableBase, table=True):
    __tablename__ = "RestaurantTables"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class RestaurantTablePublic(RestaurantTableBase):
    id: uuid.UUID


class RestaurantTablesPublic(SQLModel):
    data: list[RestaurantTablePublic]
    count: int
