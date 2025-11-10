import uuid
from sqlmodel import Field, SQLModel

class TasaImpositivaBase(SQLModel):
    nombre: str = Field(index=True, unique=True)
    porcentaje: float

class TasaImpositivaCreate(TasaImpositivaBase):
    pass

class TasaImpositivaUpdate(SQLModel):
    nombre: str
    porcentaje: float

class TasaImpositiva(TasaImpositivaBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class TasaImpositivaPublic(TasaImpositivaBase):
    id: uuid.UUID

class TasasImpositivasPublic(SQLModel):
    data: list[TasaImpositivaPublic]
    count: int