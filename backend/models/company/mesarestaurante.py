import uuid
from sqlmodel import Field, SQLModel

class MesaRestauranteBase(SQLModel):
    numero_mesa: int = Field(index=True)
    capacidad: int
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")

class MesaRestauranteCreate(MesaRestauranteBase):
    pass

class MesaRestauranteUpdate(SQLModel):
    numero_mesa: int | None = None
    capacidad: int | None = None
    restaurante_id: uuid.UUID | None = None

class MesaRestaurante(MesaRestauranteBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class MesaRestaurantePublic(MesaRestauranteBase):
    id: uuid.UUID

class MesaRestaurantesPublic(SQLModel):
    data: list[MesaRestaurantePublic]
    count: int