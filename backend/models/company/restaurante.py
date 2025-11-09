import uuid
from sqlmodel import Field, SQLModel

class RestauranteBase(SQLModel):
    nombre: str = Field(index=True)
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None

class RestauranteCreate(RestauranteBase):
    pass

class RestauranteUpdate(SQLModel):
    numero_mesa: int
    capacidad: int
    restaurante_id: uuid.UUID

class Restaurante(RestauranteBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class RestaurantePublic(RestauranteBase):
    id: uuid.UUID

class RestaurantesPublic(SQLModel):
    data: list[RestaurantePublic]
    count: int