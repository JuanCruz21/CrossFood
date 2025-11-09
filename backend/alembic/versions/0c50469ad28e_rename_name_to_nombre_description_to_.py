"""rename_name_to_nombre_description_to_descripcion

Revision ID: 0c50469ad28e
Revises: 8b8a1dbb1be0
Create Date: 2025-11-08 23:05:58.273783

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import uuid

# revision identifiers, used by Alembic.


# revision identifiers, used by Alembic.
revision: str = '0c50469ad28e'
down_revision: Union[str, Sequence[str], None] = '8b8a1dbb1be0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Renombrar columnas en tabla permiso (preservando datos)
    op.alter_column('permiso', 'name', new_column_name='nombre')
    op.alter_column('permiso', 'description', new_column_name='descripcion')
    op.drop_index(op.f('ix_permiso_name'), table_name='permiso', if_exists=True)
    op.create_index(op.f('ix_permiso_nombre'), 'permiso', ['nombre'], unique=True)
    
    # Renombrar columnas en tabla rol (preservando datos)
    op.alter_column('rol', 'name', new_column_name='nombre')
    op.alter_column('rol', 'description', new_column_name='descripcion')
    op.drop_index(op.f('ix_rol_name'), table_name='rol', if_exists=True)
    op.create_index(op.f('ix_rol_nombre'), 'rol', ['nombre'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Revertir renombrado en tabla rol
    op.drop_index(op.f('ix_rol_nombre'), table_name='rol')
    op.create_index(op.f('ix_rol_name'), 'rol', ['name'], unique=True)
    op.alter_column('rol', 'descripcion', new_column_name='description')
    op.alter_column('rol', 'nombre', new_column_name='name')
    
    # Revertir renombrado en tabla permiso
    op.drop_index(op.f('ix_permiso_nombre'), table_name='permiso')
    op.create_index(op.f('ix_permiso_name'), 'permiso', ['name'], unique=True)
    op.alter_column('permiso', 'descripcion', new_column_name='description')
    op.alter_column('permiso', 'nombre', new_column_name='name')
