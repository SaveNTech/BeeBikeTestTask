from fastapi import FastAPI, HTTPException
from fastapi.exception_handlers import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

import app.models  # noqa: F401  (registers all models on Base.metadata)
from app.api.routes import admin, analytics, auth, customers, rentals, scooters
from app.api.routes import settings as settings_routes
from app.core.config import settings

app = FastAPI(title="BeeBike CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={
            "detail": "Конфликт данных: запись с такими значениями уже существует "
            "или нарушена связь с другой записью."
        },
    )


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc: HTTPException):
    return await http_exception_handler(request, exc)


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(scooters.router, prefix="/api/scooters", tags=["scooters"])
app.include_router(rentals.router, prefix="/api/rentals", tags=["rentals"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(settings_routes.router, prefix="/api/settings", tags=["settings"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}
