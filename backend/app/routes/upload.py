import os
import uuid
from typing import Any
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pathlib import Path

router = APIRouter(prefix="/upload", tags=["upload"])

# Directorio base para uploads
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
PRODUCTOS_DIR = UPLOAD_DIR / "productos"

# Crear directorio base si no existe
PRODUCTOS_DIR.mkdir(parents=True, exist_ok=True)

# Extensiones permitidas
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/producto", response_model=dict)
async def upload_producto_image(
    file: UploadFile = File(...),
    empresa_id: str = Form(...)
) -> Any:
    """
    Subir imagen de producto organizada por empresa.
    Retorna la URL relativa de la imagen subida.
    """
    # Validar extensión
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nombre de archivo no válido")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Leer y validar tamaño
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo es demasiado grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024}MB",
        )

    # Crear directorio de la empresa si no existe
    empresa_dir = PRODUCTOS_DIR / empresa_id
    empresa_dir.mkdir(parents=True, exist_ok=True)

    # Generar nombre único
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = empresa_dir / unique_filename

    # Guardar archivo
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar archivo: {str(e)}",
        )

    # Retornar URL relativa
    return {
        "filename": unique_filename,
        "url": f"/uploads/productos/{empresa_id}/{unique_filename}",
        "size": len(contents),
    }


@router.delete("/producto/{empresa_id}/{filename}", response_model=dict)
async def delete_producto_image(empresa_id: str, filename: str) -> Any:
    """
    Eliminar imagen de producto de una empresa específica.
    """
    file_path = PRODUCTOS_DIR / empresa_id / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Imagen no encontrada",
        )

    try:
        file_path.unlink()
        
        # Intentar eliminar el directorio de la empresa si está vacío
        empresa_dir = PRODUCTOS_DIR / empresa_id
        try:
            empresa_dir.rmdir()  # Solo elimina si está vacío
        except OSError:
            pass  # El directorio no está vacío o no se puede eliminar
        
        return {"message": "Imagen eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar imagen: {str(e)}",
        )
