import uuid
from typing import Any

from sqlmodel import Session, select, func
from typing import List

from models.categories import Category, CategoryCreate, CategoryUpdate


def create_category(*, session: Session, category_create: CategoryCreate) -> Category:
    db_obj = Category.model_validate(category_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_category_by_id(*, session: Session, category_id: uuid.UUID) -> Category | None:
    return session.get(Category, category_id)


def get_categories(*, session: Session, skip: int = 0, limit: int = 100, restaurant_id: uuid.UUID | None = None) -> tuple[list[Category], int]:
    count_stmt = select(func.count()).select_from(Category)
    stmt = select(Category)
    if restaurant_id:
        stmt = stmt.where(Category.restaurant_id == restaurant_id)
        count_stmt = select(func.count()).select_from(Category).where(Category.restaurant_id == restaurant_id)

    total = int(session.exec(count_stmt).one())
    categories_seq = session.exec(stmt.offset(skip).limit(limit)).all()
    categories: List[Category] = list(categories_seq)
    return categories, total


def update_category(*, session: Session, db_category: Category, category_in: CategoryUpdate) -> Any:
    category_data = category_in.model_dump(exclude_unset=True)
    db_category.sqlmodel_update(category_data)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category


def delete_category(*, session: Session, category: Category) -> None:
    session.delete(category)
    session.commit()