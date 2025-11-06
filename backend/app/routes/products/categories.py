import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func

from app.routes.deps import SessionDep, CurrentUser
from app.routes.products import crud
from models.categories import CategoryCreate, CategoryUpdate, CategoryPublic, CategoriesPublic
from models.config import Message

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=CategoriesPublic)
def read_categories(session: SessionDep, skip: int = 0, limit: int = 100, restaurant_id: uuid.UUID | None = None) -> Any:
    """List categories with count"""
    categories, count = crud.get_categories(session=session, skip=skip, limit=limit, restaurant_id=restaurant_id)
    public_list = [CategoryPublic.model_validate(c) for c in categories]
    return CategoriesPublic(data=public_list, count=count)


@router.post("/", response_model=CategoryPublic)
def create_category(*, session: SessionDep, category_in: CategoryCreate, current_user: CurrentUser) -> Any:
    """Create a new category (authenticated users)"""
    category = crud.create_category(session=session, category_create=category_in)
    return category


@router.get("/{category_id}", response_model=CategoryPublic)
def read_category(category_id: uuid.UUID, session: SessionDep, current_user: CurrentUser) -> Any:
    category = crud.get_category_by_id(session=session, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.patch("/{category_id}", response_model=CategoryPublic)
def update_category(category_id: uuid.UUID, session: SessionDep, category_in: CategoryUpdate, current_user: CurrentUser) -> Any:
    category = crud.get_category_by_id(session=session, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    updated = crud.update_category(session=session, db_category=category, category_in=category_in)
    return updated


@router.delete("/{category_id}", response_model=Message)
def delete_category(category_id: uuid.UUID, session: SessionDep, current_user: CurrentUser) -> Any:
    category = crud.get_category_by_id(session=session, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.delete_category(session=session, category=category)
    return Message(message="Category deleted successfully")
 