from fastapi import APIRouter

from app.routes.auth.users import login, private, users, utils
from app.routes.auth.roles import roles, user_roles
from app.routes.auth.permisos import permisos, role_permisos, user_permisos
from app.routes.company.empresa import empresa
from app.routes.company.restaurante import restaurante
from app.routes.company.mesarestaurante import mesarestaurante
from app.routes.product.tasaimpositiva import routes as tasa_impositiva_routes
from app.routes.product.categoria import routes as categoria_routes
from app.routes.product.producto import routes as producto_routes
from app.routes.product.orden import routes as orden_routes
from app.routes.product.ordenitem import routes as ordenitem_routes
from core.config import settings

api_router = APIRouter()

# Rutas de autenticación existentes
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)

# Rutas de gestión de roles
api_router.include_router(roles.router)
api_router.include_router(user_roles.router)

# Rutas de gestión de permisos
api_router.include_router(permisos.router)
api_router.include_router(role_permisos.router)
api_router.include_router(user_permisos.router)

# Rutas de gestión de empresas y restaurantes
api_router.include_router(empresa.router)
api_router.include_router(restaurante.router)
api_router.include_router(mesarestaurante.router)

# Rutas de gestión de productos y órdenes
api_router.include_router(tasa_impositiva_routes.router)
api_router.include_router(categoria_routes.router)
api_router.include_router(producto_routes.router)
api_router.include_router(orden_routes.router)
api_router.include_router(ordenitem_routes.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
