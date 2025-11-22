import uuid
from pydantic import EmailStr
from sqlmodel import Field, SQLModel

# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str = Field(default=None, max_length=255)
    restaurante_id: uuid.UUID | None = Field(default=None, foreign_key="restaurante.id")
    empresa_id: uuid.UUID | None = Field(default=None, foreign_key="empresa.id")


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)

class UserRegister(SQLModel):
    """Schema for user registration with automatic empresa and restaurante creation"""
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str = Field(max_length=255)
    
    # Empresa fields (required)
    nombre_empresa: str = Field(max_length=255)
    direccion_empresa: str = Field(max_length=255)
    ciudad_empresa: str = Field(max_length=100)
    
    # Restaurante fields (required)
    nombre_restaurante: str = Field(max_length=255)
    direccion_restaurante: str | None = Field(default=None, max_length=255)
    telefono_restaurante: str | None = Field(default=None, max_length=20)


class UserCreateBasic(SQLModel):
    """Schema for basic user creation without empresa or restaurante"""
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    confirm_password: str = Field(min_length=8, max_length=40)
    full_name: str = Field(max_length=255)
    
    def model_post_init(self, __context):
        """Validate that password and confirm_password match"""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")



# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str

# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
