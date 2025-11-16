# Sistema de Permisos - CrossFood

## 📋 Descripción General

El sistema de permisos de CrossFood permite controlar de manera granular qué acciones puede realizar cada usuario en la aplicación. Los permisos pueden asignarse:

1. **Directamente al usuario** (permisos individuales)
2. **A través de roles** (permisos heredados)

Los **superusuarios** (`is_superuser=True`) tienen acceso completo automáticamente sin necesidad de permisos explícitos.

---

## 🔑 Formato de Permisos

Los permisos siguen el formato: **`recurso.accion`**

### Ejemplos:
- `rol.read` → Leer/listar roles
- `rol.write` → Crear/modificar roles
- `rol.delete` → Eliminar roles
- `user.read` → Leer usuarios
- `user.write` → Crear/modificar usuarios
- `restaurante.read` → Ver restaurantes
- `restaurante.write` → Crear/editar restaurantes

---

## 📂 Estructura del Sistema

### Archivos Clave

```
backend/app/routes/auth/permisos/
├── permissions.py          # Definición de todos los permisos
├── crud.py                 # Operaciones de base de datos
├── permisos.py            # Endpoints de la API
├── examples.py            # Ejemplos de uso
├── init_permissions.py    # Script de inicialización
└── README_PERMISSIONS.md  # Esta documentación
```

### Dependencias (deps.py)

```python
# Funciones principales:
- check_user_permissions()      # Verificar permisos manualmente
- require_permissions()         # Dependencia FastAPI (TODOS los permisos)
- require_any_permission()      # Dependencia FastAPI (AL MENOS UNO)
```

---

## 🚀 Uso en Endpoints

### 1. Requiere UN permiso específico

```python
from app.routes.deps import require_permissions
from app.routes.auth.permisos.permissions import ROL_READ

@router.get("/roles")
def list_roles(
    session: SessionDep,
    current_user: CurrentUser = Depends(require_permissions(ROL_READ))
):
    """Requiere permiso: rol.read"""
    return {"roles": [...]}
```

### 2. Requiere MÚLTIPLES permisos (AND)

```python
@router.post("/roles")
def create_role(
    session: SessionDep,
    current_user: CurrentUser = Depends(require_permissions(ROL_WRITE, ROL_READ))
):
    """Requiere: rol.write Y rol.read"""
    return {"message": "Rol creado"}
```

### 3. Requiere AL MENOS UNO de varios permisos (OR)

```python
from app.routes.deps import require_any_permission

@router.get("/dashboard")
def view_dashboard(
    session: SessionDep,
    current_user: CurrentUser = Depends(require_any_permission(
        USER_READ, ROL_READ, RESTAURANTE_READ
    ))
):
    """Requiere: user.read O rol.read O restaurante.read"""
    return {"data": [...]}
```

### 4. Validación manual (lógica personalizada)

```python
from app.routes.deps import check_user_permissions

@router.get("/custom")
def custom_logic(session: SessionDep, current_user: CurrentUser):
    has_write = check_user_permissions(
        session=session,
        user=current_user,
        required_permissions=[USER_WRITE]
    )
    
    if has_write:
        # Usuario puede escribir
        return {"level": "write"}
    else:
        # Usuario solo lectura
        return {"level": "read"}
```

---

## 🔧 Configuración Inicial

### 1. Ejecutar migración de base de datos

```bash
cd backend
alembic upgrade head
```

### 2. Inicializar permisos en la base de datos

```bash
cd backend
python -m app.routes.auth.permisos.init_permissions
```

Este script creará todos los permisos definidos en `permissions.py`.

### 3. Crear roles y asignar permisos

#### Opción A: Mediante API

```bash
# 1. Crear un rol
POST /api/v1/roles/
{
    "nombre": "Gerente",
    "descripcion": "Gerente de restaurante"
}

# 2. Asignar permisos al rol
POST /api/v1/permisos/rol/{rol_id}
{
    "permiso_id": "uuid-del-permiso"
}

# 3. Asignar rol al usuario
POST /api/v1/roles/user/{user_id}
{
    "rol_id": "uuid-del-rol"
}
```

#### Opción B: Script Python

```python
from sqlmodel import Session, select
from core.db import engine
from models.auth.permiso import Permiso
from models.auth.rol import Rol
from models.auth.permisorol import PermisoRol

with Session(engine) as session:
    # Obtener permisos
    permisos = session.exec(
        select(Permiso).where(
            Permiso.nombre.in_([
                "restaurante.read",
                "restaurante.write",
                "mesa.read",
                "mesa.write"
            ])
        )
    ).all()
    
    # Crear rol
    rol = Rol(nombre="Gerente", descripcion="Gerente de restaurante")
    session.add(rol)
    session.flush()
    
    # Asignar permisos
    for permiso in permisos:
        permiso_rol = PermisoRol(rol_id=rol.id, permiso_id=permiso.id)
        session.add(permiso_rol)
    
    session.commit()
```

---

## 📊 Endpoints de Utilidad

### Verificar mis permisos

```bash
# Ver todos mis permisos
GET /api/v1/permisos/me/check

# Verificar permisos específicos
GET /api/v1/permisos/me/check?permissions=rol.read,user.write
```

**Respuesta:**
```json
{
    "user_id": "uuid",
    "email": "user@example.com",
    "is_superuser": false,
    "requested_permissions": ["rol.read", "user.write"],
    "has_all": false,
    "permission_status": {
        "rol.read": true,
        "user.write": false
    }
}
```

### Ver permisos de un usuario

```bash
GET /api/v1/permisos/user/{user_id}/permissions
```

**Respuesta:**
```json
{
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "Juan Pérez",
    "is_superuser": false,
    "direct_permissions": ["user.read"],
    "roles": [
        {"nombre": "Gerente", "id": "rol-uuid"}
    ],
    "permissions_by_role": {
        "Gerente": ["restaurante.read", "restaurante.write", "mesa.read"]
    },
    "all_permissions": ["mesa.read", "restaurante.read", "restaurante.write", "user.read"],
    "total_permissions": 4
}
```

---

## 🎯 Permisos Disponibles

### Administración
- `rol.read`, `rol.write`, `rol.delete`
- `user.read`, `user.write`, `user.delete`
- `permission.read`, `permission.write`, `permission.delete`

### Empresas y Restaurantes
- `empresa.read`, `empresa.write`, `empresa.delete`
- `restaurante.read`, `restaurante.write`, `restaurante.delete`
- `mesa.read`, `mesa.write`, `mesa.delete`

### Operaciones
- `order.read`, `order.write`, `order.delete`
- `product.read`, `product.write`, `product.delete`
- `bill.read`, `bill.write`, `bill.delete`

Ver lista completa en `permissions.py`.

---

## 🔐 Reglas de Acceso

### Superusuarios
- Tienen **todos los permisos** automáticamente
- No necesitan asignación explícita de permisos
- Pasan todas las validaciones de permisos

### Usuarios Normales
- Deben tener permisos asignados explícitamente
- Pueden obtener permisos de dos formas:
  1. **Directos**: Asignados específicamente al usuario
  2. **Por rol**: Heredados de los roles asignados
- El sistema verifica ambas fuentes automáticamente

### Herencia de Permisos
```
Usuario
  ├── Permisos directos: [user.read]
  └── Roles
        ├── Gerente → [restaurante.read, restaurante.write, mesa.read]
        └── Operador → [order.read, order.write]

Total de permisos = user.read + restaurante.read + restaurante.write + mesa.read + order.read + order.write
```

---

## 🧪 Testing

### Probar sistema de permisos

```python
import pytest
from fastapi.testclient import TestClient

def test_permission_required(client: TestClient, auth_headers):
    """Test endpoint protegido con permisos"""
    # Sin permisos → 403
    response = client.get("/api/v1/roles/", headers=auth_headers)
    assert response.status_code == 403
    
    # Con permiso → 200
    # (asignar permiso rol.read al usuario)
    response = client.get("/api/v1/roles/", headers=auth_headers)
    assert response.status_code == 200
```

---

## 📝 Mejores Prácticas

1. **Usar constantes** de `permissions.py` en lugar de strings hardcodeados
2. **Permisos granulares**: Separar read, write, delete para cada recurso
3. **Roles por función**: Crear roles como "Gerente", "Mesero", "Cajero"
4. **Documentar endpoints**: Indicar qué permisos requiere cada endpoint
5. **Validar en frontend**: Ocultar/deshabilitar opciones según permisos del usuario

---

## 🐛 Troubleshooting

### "Se requieren los siguientes permisos: X"
- Verificar que el usuario tiene el permiso asignado
- Verificar que los roles del usuario incluyen ese permiso
- Superusuarios deberían pasar automáticamente

### "Usuario no tiene permisos pero debería"
- Verificar: `GET /api/v1/permisos/me/check`
- Confirmar que el permiso existe en BD
- Confirmar que la asociación permiso-rol-usuario está correcta

### "Importación circular"
- Las funciones en `deps.py` usan importaciones locales para evitar esto
- No importar funciones de permisos en módulos de modelos

---

## 🔄 Flujo Completo de Ejemplo

```bash
# 1. Inicializar permisos
python -m app.routes.auth.permisos.init_permissions

# 2. Crear rol "Gerente"
POST /api/v1/roles/
{"nombre": "Gerente", "descripcion": "Gerente de restaurante"}

# 3. Obtener IDs de permisos necesarios
GET /api/v1/permisos/nombre/restaurante.read
GET /api/v1/permisos/nombre/restaurante.write
GET /api/v1/permisos/nombre/mesa.read
GET /api/v1/permisos/nombre/mesa.write

# 4. Asignar permisos al rol
POST /api/v1/permisos/rol/{rol_id}
{"permiso_id": "permiso-uuid-1"}
POST /api/v1/permisos/rol/{rol_id}
{"permiso_id": "permiso-uuid-2"}
# ... etc

# 5. Asignar rol al usuario
POST /api/v1/roles/user/{user_id}
{"rol_id": "rol-uuid"}

# 6. Verificar permisos del usuario
GET /api/v1/permisos/user/{user_id}/permissions

# 7. Usuario ahora puede acceder a endpoints protegidos
GET /api/v1/restaurantes/  # ✓ Requiere restaurante.read
POST /api/v1/restaurantes/ # ✓ Requiere restaurante.write
```

---

## 📚 Referencias

- **Código fuente**: `backend/app/routes/auth/permisos/`
- **Ejemplos**: `backend/app/routes/auth/permisos/examples.py`
- **Constantes**: `backend/app/routes/auth/permisos/permissions.py`
- **Dependencias**: `backend/app/routes/deps.py`
