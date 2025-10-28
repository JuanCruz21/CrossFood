import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserRoleBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    role_id: uuid.UUID = Field(foreign_key="Roles.id")
    restaurant_id: uuid.UUID = Field(foreign_key="Restaurants.id")


# Properties to receive via API on creation
class UserRoleCreate(UserRoleBase):
    pass


# Properties to receive via API on update, all are optional
class UserRoleUpdate(SQLModel):
    user_id: uuid.UUID | None = Field(default=None)
    role_id: uuid.UUID | None = Field(default=None)
    restaurant_id: uuid.UUID | None = Field(default=None)


# Database model, database table inferred from class name
class UserRole(UserRoleBase, table=True):
    __tablename__ = "UserRoles"
    
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role_id: uuid.UUID = Field(foreign_key="Roles.id", primary_key=True)
    restaurant_id: uuid.UUID = Field(foreign_key="Restaurants.id", primary_key=True)


# Properties to return via API
class UserRolePublic(UserRoleBase):
    pass


class UserRolesPublic(SQLModel):
    data: list[UserRolePublic]
    count: int
