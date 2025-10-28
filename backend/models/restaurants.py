import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class RestaurantBase(SQLModel):
    company_id: uuid.UUID = Field(foreign_key="Companies.id")
    name: str = Field(max_length=255)
    address: str | None = Field(default=None)
    phone_number: str | None = Field(default=None, max_length=20)


# Properties to receive via API on creation
class RestaurantCreate(RestaurantBase):
    pass


# Properties to receive via API on update, all are optional
class RestaurantUpdate(SQLModel):
    company_id: uuid.UUID | None = Field(default=None)
    name: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None)
    phone_number: str | None = Field(default=None, max_length=20)


# Database model, database table inferred from class name
class Restaurant(RestaurantBase, table=True):
    __tablename__ = "Restaurants"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))


# Properties to return via API, id is always required
class RestaurantPublic(RestaurantBase):
    id: uuid.UUID
    created_at: datetime | None
    updated_at: datetime | None


class RestaurantsPublic(SQLModel):
    data: list[RestaurantPublic]
    count: int
