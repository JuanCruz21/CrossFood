import uuid

from sqlmodel import Field, SQLModel
from datetime import datetime


class PermisoBase(SQLModel):
    nombre: str = Field(index=True, unique=True)
    descripcion: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

class PermisoCreate(PermisoBase):
    pass

class PermisoUpdate(SQLModel):
    nombre: str | None = None
    descripcion: str | None = None

class Permiso(PermisoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class PermisoPublic(PermisoBase):
    id: uuid.UUID

class PermisosPublic(SQLModel):
    data: list[PermisoPublic]
    count: int