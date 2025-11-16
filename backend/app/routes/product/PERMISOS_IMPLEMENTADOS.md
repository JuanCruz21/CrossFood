# Sistema de Permisos - Módulo de Productos y Pedidos

## ✅ Verificación Completada

Se ha implementado correctamente el sistema de permisos en todos los endpoints del módulo de productos y pedidos. Todos los endpoints ahora verifican los permisos apropiados antes de permitir el acceso.

---

## 📋 Permisos Utilizados

### Permisos de Productos
- **`PRODUCT_READ`**: Leer y listar productos, categorías y tasas impositivas
- **`PRODUCT_WRITE`**: Crear y modificar productos, categorías y tasas impositivas
- **`PRODUCT_DELETE`**: Eliminar productos, categorías y tasas impositivas

### Permisos de Órdenes
- **`ORDER_READ`**: Leer y listar órdenes e items de orden
- **`ORDER_WRITE`**: Crear y modificar órdenes e items de orden
- **`ORDER_DELETE`**: Eliminar órdenes e items de orden

---

## 🔐 Implementación por Módulo

### 1. Tasas Impositivas (`/tasas-impositivas`)

| Endpoint | Método | Permiso Requerido |
|----------|--------|-------------------|
| `GET /` | Lista todas | `PRODUCT_READ` |
| `POST /` | Crear nueva | `PRODUCT_WRITE` |
| `GET /{id}` | Obtener por ID | `PRODUCT_READ` |
| `PATCH /{id}` | Actualizar | `PRODUCT_WRITE` |
| `DELETE /{id}` | Eliminar | `PRODUCT_DELETE` |

### 2. Categorías (`/categorias`)

| Endpoint | Método | Permiso Requerido |
|----------|--------|-------------------|
| `GET /` | Lista todas | `PRODUCT_READ` |
| `POST /` | Crear nueva | `PRODUCT_WRITE` |
| `GET /{id}` | Obtener por ID | `PRODUCT_READ` |
| `PATCH /{id}` | Actualizar | `PRODUCT_WRITE` |
| `DELETE /{id}` | Eliminar | `PRODUCT_DELETE` |

### 3. Productos (`/productos`)

| Endpoint | Método | Permiso Requerido |
|----------|--------|-------------------|
| `GET /` | Lista todos | `PRODUCT_READ` |
| `POST /` | Crear nuevo | `PRODUCT_WRITE` |
| `GET /{id}` | Obtener por ID | `PRODUCT_READ` |
| `PATCH /{id}` | Actualizar | `PRODUCT_WRITE` |
| `PATCH /{id}/stock` | Actualizar stock | `PRODUCT_WRITE` |
| `DELETE /{id}` | Eliminar | `PRODUCT_DELETE` |

### 4. Órdenes (`/ordenes`)

| Endpoint | Método | Permiso Requerido |
|----------|--------|-------------------|
| `GET /` | Lista todas | `ORDER_READ` |
| `POST /` | Crear nueva | `ORDER_WRITE` |
| `GET /{id}` | Obtener por ID | `ORDER_READ` |
| `PATCH /{id}` | Actualizar | `ORDER_WRITE` |
| `PATCH /{id}/estado` | Actualizar estado | `ORDER_WRITE` |
| `DELETE /{id}` | Eliminar | `ORDER_DELETE` |

### 5. Items de Orden (`/orden-items`)

| Endpoint | Método | Permiso Requerido |
|----------|--------|-------------------|
| `GET /orden/{orden_id}` | Lista items de orden | `ORDER_READ` |
| `GET /producto/{producto_id}` | Lista items por producto | `ORDER_READ` |
| `POST /` | Crear item | `ORDER_WRITE` |
| `GET /{id}` | Obtener por ID | `ORDER_READ` |
| `PATCH /{id}` | Actualizar item | `ORDER_WRITE` |
| `PATCH /{id}/cantidad` | Actualizar cantidad | `ORDER_WRITE` |
| `DELETE /{id}` | Eliminar item | `ORDER_DELETE` |
| `DELETE /orden/{orden_id}` | Eliminar todos los items | `ORDER_DELETE` |

---

## 🔧 Cómo Funciona el Sistema de Permisos

### 1. Función `require_permissions()`

```python
from app.routes.deps import require_permissions
from app.routes.auth.permisos.permissions import PRODUCT_READ, PRODUCT_WRITE

@router.get("/", dependencies=[Depends(require_permissions(PRODUCT_READ))])
def endpoint_protegido():
    # Este endpoint requiere el permiso PRODUCT_READ
    pass
```

### 2. Verificación de Permisos

El sistema verifica:
1. **Superusuarios**: Tienen todos los permisos automáticamente
2. **Permisos Directos**: Permisos asignados directamente al usuario
3. **Permisos de Roles**: Permisos heredados de los roles asignados al usuario

### 3. Respuesta en Caso de Falta de Permisos

Si un usuario no tiene los permisos requeridos:
- **Código de Estado**: `403 Forbidden`
- **Mensaje**: "Se requieren los siguientes permisos: {lista de permisos}"

---

## 👥 Grupos de Permisos Sugeridos

### Operador de Restaurante
```python
permisos = [
    PRODUCT_READ,      # Puede ver productos y categorías
    ORDER_READ,        # Puede ver órdenes
    ORDER_WRITE,       # Puede crear y modificar órdenes
]
```

### Gerente de Restaurante
```python
permisos = [
    PRODUCT_READ,      # Puede ver productos
    PRODUCT_WRITE,     # Puede crear y modificar productos
    ORDER_READ,        # Puede ver órdenes
    ORDER_WRITE,       # Puede crear y modificar órdenes
    ORDER_DELETE,      # Puede eliminar órdenes
]
```

### Administrador de Inventario
```python
permisos = [
    PRODUCT_READ,      # Puede ver productos
    PRODUCT_WRITE,     # Puede crear y modificar productos
    PRODUCT_DELETE,    # Puede eliminar productos
]
```

### Superusuario
- Tiene **todos los permisos** automáticamente
- No necesita asignaciones específicas

---

## 📊 Resumen de Cambios

### Archivos Modificados:
1. ✅ `/routes/product/tasaimpositiva/routes.py`
2. ✅ `/routes/product/categoria/routes.py`
3. ✅ `/routes/product/producto/routes.py`
4. ✅ `/routes/product/orden/routes.py`
5. ✅ `/routes/product/ordenitem/routes.py`

### Total de Endpoints Protegidos: **30 endpoints**

### Importaciones Agregadas:
```python
from app.routes.deps import require_permissions
from app.routes.auth.permisos.permissions import (
    PRODUCT_READ, PRODUCT_WRITE, PRODUCT_DELETE,  # Para productos
    ORDER_READ, ORDER_WRITE, ORDER_DELETE           # Para órdenes
)
```

---

## 🧪 Cómo Probar el Sistema de Permisos

### 1. Crear Usuario de Prueba
```bash
# Crear un usuario sin permisos
POST /api/v1/users/
```

### 2. Intentar Acceder a un Endpoint Protegido
```bash
# Debería recibir 403 Forbidden
GET /api/v1/productos/
Authorization: Bearer {token_usuario_sin_permisos}
```

### 3. Asignar Permisos
```bash
# Asignar permiso PRODUCT_READ al usuario
POST /api/v1/user-permissions/assign
{
  "user_id": "uuid-del-usuario",
  "permiso_name": "product.read"
}
```

### 4. Reintentar el Acceso
```bash
# Ahora debería funcionar
GET /api/v1/productos/
Authorization: Bearer {token_usuario_con_permiso}
```

---

## 🔍 Verificación de Integridad

### ✅ Todos los endpoints verifican permisos
- No hay endpoints sin protección de permisos
- Cada operación CRUD está protegida apropiadamente

### ✅ Permisos granulares
- Operaciones de lectura: `READ`
- Operaciones de escritura (crear/actualizar): `WRITE`
- Operaciones de eliminación: `DELETE`

### ✅ Superusuarios tienen acceso completo
- Bypass automático de verificación de permisos
- No necesitan permisos explícitos

### ✅ Mensajes de error claros
- Indica qué permisos faltan
- Código de estado HTTP correcto (403)

---

## 📝 Notas Importantes

1. **CurrentUser ya no es necesario**: Los endpoints ya no requieren el parámetro `CurrentUser` porque la verificación de permisos se hace a nivel de dependencia.

2. **Permisos heredados**: Los usuarios heredan permisos de sus roles, además de tener permisos directos.

3. **Superusuarios**: `is_superuser=True` otorga acceso completo automáticamente.

4. **Extensibilidad**: El sistema permite agregar nuevos permisos fácilmente en `permissions.py`.

---

## ✨ Conclusión

El sistema de permisos está **correctamente implementado y verificado** en todos los endpoints del módulo de productos y pedidos. Todos los endpoints ahora:

- ✅ Verifican permisos apropiados
- ✅ Respetan la jerarquía de permisos
- ✅ Permiten acceso a superusuarios
- ✅ Retornan errores claros cuando faltan permisos
- ✅ No tienen errores de compilación
