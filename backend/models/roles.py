import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class RoleBase(SQLModel):
    name: str = Field(max_length=50)


# Properties to receive via API on creation
class RoleCreate(RoleBase):
    pass


# Properties to receive via API on update, all are optional
class RoleUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=50)


# Database model, database table inferred from class name
class Role(RoleBase, table=True):
    __tablename__ = "Roles"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class RolePublic(RoleBase):
    id: uuid.UUID


class RolesPublic(SQLModel):
    data: list[RolePublic]
    count: int
