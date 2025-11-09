# Importar todos los modelos para que SQLModel los reconozca
from models.auth.users import User, UserCreate, UserPublic, UserUpdate
from models.auth.rol import Rol, RolCreate, RolPublic, RolUpdate
from models.auth.permiso import Permiso, PermisoCreate, PermisoPublic, PermisoUpdate
from models.auth.roluser import RolUserBase, RolUserCreate, RolUserPublic, RolUserUpdate
from models.auth.permisorol import PermisoRol, PermisoRolCreate, PermisoRolPublic, PermisoRolUpdate
from models.auth.permisousuario import PermisoUsuario, PermisoUsuarioCreate, PermisoUsuarioPublic, PermisoUsuarioUpdate
from models.company.restaurante import Restaurante, RestauranteCreate, RestaurantePublic, RestauranteUpdate
from models.company.empresa import Empresa
from models.company.mesarestaurante import MesaRestaurante
from models.product.categoria import Categoria

__all__ = [
    # Users
    "User",
    "UserCreate",
    "UserUpdate",
    "UserPublic",
    # Roles
    "Rol",
    "RolCreate",
    "RolPublic",
    "RolUpdate",
    # Permisos
    "Permiso",
    "PermisoCreate",
    "PermisoPublic",
    "PermisoUpdate",
    # RolUser
    "RolUserBase",
    "RolUserCreate",
    "RolUserUpdate",
    "RolUserPublic",
    # PermisoRol
    "PermisoRol",
    "PermisoRolCreate",
    "PermisoRolUpdate",
    "PermisoRolPublic",
    # PermisoUsuario
    "PermisoUsuario",
    "PermisoUsuarioCreate",
    "PermisoUsuarioUpdate",
    "PermisoUsuarioPublic",
    # Restaurante
    "Restaurante",
    "RestauranteCreate",
    "RestauranteUpdate",
    "RestaurantePublic",
    # Empresa
    "Empresa",
    # MesaRestaurante
    "MesaRestaurante",
    # Categoria
    "Categoria",
]
