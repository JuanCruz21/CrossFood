import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class CompanyBase(SQLModel):
    legal_name: str | None = Field(default=None, max_length=255)
    tax_id: str = Field(unique=True, index=True, max_length=20)
    fiscal_address: str | None = Field(default=None)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=10)
    country: str | None = Field(default=None, max_length=50)


# Properties to receive via API on creation
class CompanyCreate(CompanyBase):
    pass


# Properties to receive via API on update, all are optional
class CompanyUpdate(SQLModel):
    legal_name: str | None = Field(default=None, max_length=255)
    tax_id: str | None = Field(default=None, max_length=20)
    fiscal_address: str | None = Field(default=None)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=10)
    country: str | None = Field(default=None, max_length=50)


# Database model, database table inferred from class name
class Company(CompanyBase, table=True):
    __tablename__ = "Companies"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))


# Properties to return via API, id is always required
class CompanyPublic(CompanyBase):
    id: uuid.UUID
    created_at: datetime | None
    updated_at: datetime | None


class CompaniesPublic(SQLModel):
    data: list[CompanyPublic]
    count: int
