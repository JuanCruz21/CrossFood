from fastapi import APIRouter

from app.routes.auth.users import login, private, users, utils
from app.routes.auth.roles import roles, user_roles
from app.routes.auth.permisos import permisos, role_permisos, user_permisos
from app.routes.company.empresa import empresa
from app.routes.company.restaurante import restaurante
from app.routes.company.mesarestaurante import mesarestaurante
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

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
