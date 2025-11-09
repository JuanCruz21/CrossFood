import uuid
from typing import TYPE_CHECKING

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime
from typing import Optional


class RolBase(SQLModel):
    nombre: str = Field(index=True, unique=True)
    descripcion: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

class RolCreate(RolBase):
    pass

class RolUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None

class Rol(RolBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class RolPublic(RolBase):
    id: uuid.UUID

class RolesPublic(SQLModel):
    data: list[RolPublic]
    count: int