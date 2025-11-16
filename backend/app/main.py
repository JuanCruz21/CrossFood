import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.routes.main import api_router
from core.config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set all CORS enabled origins
origins = settings.all_cors_origins

# In development/staging environments, allow traefik.me domains
if settings.ENVIRONMENT in ["local", "staging"]:
    # Allow any traefik.me subdomain for development
    origins.extend([
        "http://botogo-frontend-h8eqpk-38b3b4-5-180-149-124.traefik.me",
        "https://botogo-frontend-h8eqpk-38b3b4-5-180-149-124.traefik.me",
        "http://botogo-backend-isp9bj-36a1b9-5-180-149-124.traefik.me",
        "https://botogo-backend-isp9bj-36a1b9-5-180-149-124.traefik.me",
        "http://localhost:3001",
        "http://localhost:3000",
    ])

if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Servir archivos estáticos (imágenes)
from fastapi.staticfiles import StaticFiles
from pathlib import Path

uploads_dir = Path(__file__).parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
