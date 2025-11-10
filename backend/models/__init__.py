# Importar todos los modelos para que SQLModel los reconozca
from models.auth.users import User, UserCreate, UserPublic, UserUpdate
from models.auth.rol import Rol, RolCreate, RolPublic, RolUpdate
from models.auth.permiso import Permiso, PermisoCreate, PermisoPublic, PermisoUpdate
from models.auth.roluser import RolUserBase, RolUserCreate, RolUserPublic, RolUserUpdate
from models.auth.permisorol import PermisoRol, PermisoRolCreate, PermisoRolPublic, PermisoRolUpdate
from models.auth.permisousuario import PermisoUsuario, PermisoUsuarioCreate, PermisoUsuarioPublic, PermisoUsuarioUpdate
from models.company.restaurante import Restaurante, RestauranteCreate, RestaurantePublic, RestauranteUpdate, RestaurantesPublic
from models.company.empresa import Empresa, EmpresaCreate, EmpresaPublic, EmpresaUpdate, EmpresasPublic
from models.company.mesarestaurante import MesaRestaurante, MesaRestauranteCreate, MesaRestaurantePublic, MesaRestauranteUpdate, MesaRestaurantesPublic
from models.product.categoria import Categoria, CategoriaCreate, CategoriaPublic, CategoriaUpdate, CategoriasPublic
from models.product.tasaimpositiva import TasaImpositiva, TasaImpositivaCreate, TasaImpositivaPublic, TasaImpositivaUpdate, TasasImpositivasPublic

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
    # Empresa
    "Empresa",
    "EmpresaCreate",
    "EmpresaUpdate",
    "EmpresaPublic",
    "EmpresasPublic",
    # Restaurante
    "Restaurante",
    "RestauranteCreate",
    "RestauranteUpdate",
    "RestaurantePublic",
    "RestaurantesPublic",
    # MesaRestaurante
    "MesaRestaurante",
    "MesaRestauranteCreate",
    "MesaRestauranteUpdate",
    "MesaRestaurantePublic",
    "MesaRestaurantesPublic",
    # Categoria
    "Categoria",
    "CategoriaCreate",
    "CategoriaUpdate",
    "CategoriaPublic",
    "CategoriasPublic",
    # TasaImpositiva
    "TasaImpositiva",
    "TasaImpositivaCreate",
    "TasaImpositivaUpdate",
    "TasaImpositivaPublic",
    "TasasImpositivasPublic",
]
