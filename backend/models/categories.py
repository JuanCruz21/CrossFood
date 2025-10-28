import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class CategoryBase(SQLModel):
    restaurant_id: uuid.UUID | None = Field(default=None, foreign_key="Restaurants.id")
    name: str = Field(max_length=100)
    parent_category_id: uuid.UUID | None = Field(default=None, foreign_key="Categories.id")


# Properties to receive via API on creation
class CategoryCreate(CategoryBase):
    pass


# Properties to receive via API on update, all are optional
class CategoryUpdate(SQLModel):
    restaurant_id: uuid.UUID | None = Field(default=None)
    name: str | None = Field(default=None, max_length=100)
    parent_category_id: uuid.UUID | None = Field(default=None)


# Database model, database table inferred from class name
class Category(CategoryBase, table=True):
    __tablename__ = "Categories"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class CategoryPublic(CategoryBase):
    id: uuid.UUID


class CategoriesPublic(SQLModel):
    data: list[CategoryPublic]
    count: int
