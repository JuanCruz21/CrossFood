import uuid
from sqlmodel import Field, SQLModel


class PermisoUsuarioBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    permiso_id: uuid.UUID = Field(foreign_key="permiso.id")

class PermisoUsuarioCreate(PermisoUsuarioBase):
    pass

class PermisoUsuarioUpdate(SQLModel):
    user_id: uuid.UUID
    permiso_id: uuid.UUID

class PermisoUsuario(PermisoUsuarioBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class PermisoUsuarioPublic(PermisoUsuarioBase):
    id: uuid.UUID

class PermisoUsuariosPublic(SQLModel):
    data: list[PermisoUsuarioPublic]
    count: int