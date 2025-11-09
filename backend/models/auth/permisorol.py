import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class PermisoRolBase(SQLModel):
    permiso_id: uuid.UUID | None = Field(foreign_key="permiso.id")
    rol_id: uuid.UUID = Field(foreign_key="rol.id")
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_by: uuid.UUID = Field(foreign_key="user.id")

class PermisoRolCreate(PermisoRolBase):
    pass

class PermisoRolUpdate(SQLModel):
    permiso_id: uuid.UUID | None = Field(foreign_key="permiso.id")
    rol_id: uuid.UUID
    assigned_at: datetime
    assigned_by: uuid.UUID

class PermisoRol(PermisoRolBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class PermisoRolPublic(PermisoRolBase):
    id: uuid.UUID

class PermisoRolsPublic(SQLModel):
    data: list[PermisoRolPublic]
    count: int