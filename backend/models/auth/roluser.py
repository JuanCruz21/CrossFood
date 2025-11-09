import uuid

from sqlmodel import Field, SQLModel
from datetime import datetime


class RolUserBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    rol_id: uuid.UUID = Field(foreign_key="rol.id")
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_by: uuid.UUID = Field(foreign_key="user.id")

class RolUserCreate(RolUserBase):
    pass

class RolUserUpdate(SQLModel):
    user_id: uuid.UUID
    rol_id: uuid.UUID
    assigned_at: datetime
    assigned_by: uuid.UUID

class RolUser(RolUserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class RolUserPublic(RolUserBase):
    id: uuid.UUID

class RolUsersPublic(SQLModel):
    data: list[RolUserPublic]
    count: int