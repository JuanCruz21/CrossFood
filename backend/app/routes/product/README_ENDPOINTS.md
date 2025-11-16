# Documentación de Endpoints - Módulo de Productos y Pedidos

## Resumen

Se han creado los siguientes módulos con sus respectivas operaciones CRUD:

1. **Tasas Impositivas** - Gestión de tasas de impuestos
2. **Categorías** - Gestión de categorías de productos
3. **Productos** - Gestión del catálogo de productos
4. **Órdenes** - Gestión de pedidos
5. **Items de Orden** - Gestión de productos dentro de los pedidos

---

## 1. Tasas Impositivas (`/tasas-impositivas`)

### Endpoints:

- **GET** `/tasas-impositivas/` - Listar todas las tasas impositivas
  - Parámetros: `skip`, `limit` (paginación)
  - Respuesta: `TasasImpositivasPublic`
  - Acceso: Usuarios autenticados

- **POST** `/tasas-impositivas/` - Crear nueva tasa impositiva
  - Body: `TasaImpositivaCreate` (nombre, porcentaje)
  - Respuesta: `TasaImpositivaPublic`
  - Acceso: Solo superusuarios
  - Validación: Nombre único

- **GET** `/tasas-impositivas/{tasa_id}` - Obtener tasa por ID
  - Respuesta: `TasaImpositivaPublic`
  - Acceso: Usuarios autenticados

- **PATCH** `/tasas-impositivas/{tasa_id}` - Actualizar tasa
  - Body: `TasaImpositivaUpdate`
  - Respuesta: `TasaImpositivaPublic`
  - Acceso: Solo superusuarios
  - Validación: Nombre único al actualizar

- **DELETE** `/tasas-impositivas/{tasa_id}` - Eliminar tasa
  - Respuesta: `Message`
  - Acceso: Solo superusuarios

---

## 2. Categorías (`/categorias`)

### Endpoints:

- **GET** `/categorias/` - Listar categorías
  - Parámetros: `restaurante_id` (opcional), `skip`, `limit`
  - Respuesta: `CategoriasPublic`
  - Filtros: Por restaurante o todas
  - Acceso: Usuarios autenticados

- **POST** `/categorias/` - Crear nueva categoría
  - Body: `CategoriaCreate` (nombre, descripcion, restaurante_id)
  - Respuesta: `CategoriaPublic`
  - Acceso: Usuarios autenticados
  - Validación: Nombre único por restaurante

- **GET** `/categorias/{categoria_id}` - Obtener categoría por ID
  - Respuesta: `CategoriaPublic`
  - Acceso: Usuarios autenticados

- **PATCH** `/categorias/{categoria_id}` - Actualizar categoría
  - Body: `CategoriaUpdate`
  - Respuesta: `CategoriaPublic`
  - Acceso: Usuarios autenticados
  - Validación: Nombre único por restaurante al actualizar

- **DELETE** `/categorias/{categoria_id}` - Eliminar categoría
  - Respuesta: `Message`
  - Acceso: Usuarios autenticados

---

## 3. Productos (`/productos`)

### Endpoints:

- **GET** `/productos/` - Listar productos
  - Parámetros: `restaurante_id`, `categoria_id`, `empresa_id` (opcionales), `skip`, `limit`
  - Respuesta: `ProductosPublic`
  - Filtros: Por restaurante, categoría, empresa o todos
  - Acceso: Usuarios autenticados

- **POST** `/productos/` - Crear nuevo producto
  - Body: `ProductoCreate` (nombre, descripcion, precio, stock, imagen, empresa_id, tasa_impositiva_id, restaurante_id, categoria_id)
  - Respuesta: `ProductoPublic`
  - Acceso: Usuarios autenticados
  - Validación: Nombre único

- **GET** `/productos/{producto_id}` - Obtener producto por ID
  - Respuesta: `ProductoPublic`
  - Acceso: Usuarios autenticados

- **PATCH** `/productos/{producto_id}` - Actualizar producto
  - Body: `ProductoUpdate`
  - Respuesta: `ProductoPublic`
  - Acceso: Usuarios autenticados
  - Validación: Nombre único al actualizar

- **PATCH** `/productos/{producto_id}/stock` - Actualizar stock
  - Parámetros: `cantidad` (puede ser positivo o negativo)
  - Respuesta: `ProductoPublic`
  - Acceso: Usuarios autenticados
  - Validación: Stock no puede ser negativo

- **DELETE** `/productos/{producto_id}` - Eliminar producto
  - Respuesta: `Message`
  - Acceso: Usuarios autenticados

---

## 4. Órdenes (`/ordenes`)

### Endpoints:

- **GET** `/ordenes/` - Listar órdenes
  - Parámetros: `restaurante_id`, `cliente_id`, `mesa_id`, `estado` (opcionales), `skip`, `limit`
  - Respuesta: `OrdenesPublic`
  - Filtros: Por restaurante, cliente, mesa, estado o todas
  - Estados válidos: `pendiente`, `en_proceso`, `completada`, `cancelada`
  - Acceso: Usuarios autenticados

- **POST** `/ordenes/` - Crear nueva orden
  - Body: `OrdenCreate` (fecha, total, estado, mesa_id, cliente_id, restaurante_id)
  - Respuesta: `OrdenPublic`
  - Acceso: Usuarios autenticados

- **GET** `/ordenes/{orden_id}` - Obtener orden por ID
  - Respuesta: `OrdenPublic`
  - Acceso: Usuarios autenticados

- **PATCH** `/ordenes/{orden_id}` - Actualizar orden
  - Body: `OrdenUpdate`
  - Respuesta: `OrdenPublic`
  - Acceso: Usuarios autenticados

- **PATCH** `/ordenes/{orden_id}/estado` - Actualizar estado de orden
  - Parámetros: `nuevo_estado`
  - Respuesta: `OrdenPublic`
  - Acceso: Usuarios autenticados
  - Validación: Estado debe ser válido

- **DELETE** `/ordenes/{orden_id}` - Eliminar orden
  - Respuesta: `Message`
  - Acceso: Usuarios autenticados

---

## 5. Items de Orden (`/orden-items`)

### Endpoints:

- **GET** `/orden-items/orden/{orden_id}` - Listar items de una orden
  - Respuesta: `OrdenItemsPublic`
  - Acceso: Usuarios autenticados

- **GET** `/orden-items/producto/{producto_id}` - Listar items por producto
  - Parámetros: `skip`, `limit`
  - Respuesta: `OrdenItemsPublic`
  - Acceso: Usuarios autenticados

- **POST** `/orden-items/` - Crear item de orden (agregar producto a orden)
  - Body: `OrdenItemCreate` (orden_id, producto_id, cantidad, precio_unitario, notas)
  - Respuesta: `OrdenItemPublic`
  - Acceso: Usuarios autenticados
  - Validaciones:
    - Orden debe existir
    - Producto debe existir
    - Stock suficiente
  - Acción automática: Reduce stock del producto

- **GET** `/orden-items/{orden_item_id}` - Obtener item por ID
  - Respuesta: `OrdenItemPublic`
  - Acceso: Usuarios autenticados

- **PATCH** `/orden-items/{orden_item_id}` - Actualizar item de orden
  - Body: `OrdenItemUpdate`
  - Respuesta: `OrdenItemPublic`
  - Acceso: Usuarios autenticados
  - Acción automática: Ajusta stock si cambia la cantidad

- **PATCH** `/orden-items/{orden_item_id}/cantidad` - Actualizar solo cantidad
  - Parámetros: `nueva_cantidad`
  - Respuesta: `OrdenItemPublic`
  - Acceso: Usuarios autenticados
  - Validación: Stock suficiente si aumenta
  - Acción automática: Ajusta stock del producto

- **DELETE** `/orden-items/{orden_item_id}` - Eliminar item
  - Respuesta: `Message`
  - Acceso: Usuarios autenticados
  - Acción automática: Restaura stock del producto

- **DELETE** `/orden-items/orden/{orden_id}` - Eliminar todos los items de una orden
  - Respuesta: `Message`
  - Acceso: Usuarios autenticados
  - Acción automática: Restaura stock de todos los productos

---

## Características Principales

### Gestión de Stock Automática
Los endpoints de `OrdenItem` gestionan automáticamente el inventario:
- **Crear item**: Reduce el stock del producto
- **Actualizar cantidad**: Ajusta el stock según la diferencia
- **Eliminar item**: Restaura el stock del producto

### Validaciones de Integridad
- **Nombres únicos**: Tasas impositivas, productos
- **Nombres únicos por contexto**: Categorías (por restaurante)
- **Relaciones existentes**: Verifica que las FK existan antes de crear/actualizar
- **Stock no negativo**: Los productos no pueden tener stock negativo
- **Estados válidos**: Las órdenes solo pueden tener estados predefinidos

### Filtros Avanzados
- Productos por restaurante, categoría o empresa
- Órdenes por restaurante, cliente, mesa o estado
- Items por orden o producto

### Control de Acceso
- **Superusuarios**: Acceso completo a tasas impositivas
- **Usuarios autenticados**: Acceso completo a categorías, productos, órdenes e items

---

## Modelos de Datos

### TasaImpositiva
```python
{
    "id": "uuid",
    "nombre": "string",
    "porcentaje": "float"
}
```

### Categoria
```python
{
    "id": "uuid",
    "nombre": "string",
    "descripcion": "string | null",
    "restaurante_id": "uuid"
}
```

### Producto
```python
{
    "id": "uuid",
    "nombre": "string",
    "descripcion": "string | null",
    "precio": "float",
    "stock": "int",
    "imagen": "string | null",
    "empresa_id": "uuid",
    "tasa_impositiva_id": "uuid",
    "restaurante_id": "uuid",
    "categoria_id": "uuid"
}
```

### Orden
```python
{
    "id": "uuid",
    "fecha": "string",
    "total": "float",
    "estado": "string",  # pendiente, en_proceso, completada, cancelada
    "mesa_id": "uuid",
    "cliente_id": "uuid",
    "restaurante_id": "uuid"
}
```

### OrdenItem
```python
{
    "id": "uuid",
    "orden_id": "uuid",
    "producto_id": "uuid",
    "cantidad": "int",
    "precio_unitario": "float",
    "notas": "string"
}
```

---

## Notas de Implementación

1. **Transacciones**: Todas las operaciones CRUD utilizan transacciones de SQLModel
2. **Paginación**: Endpoints de listado soportan `skip` y `limit`
3. **Validación**: Se validan relaciones y restricciones antes de operaciones
4. **Mensajes**: Respuestas descriptivas de errores y éxitos
5. **Integridad**: La gestión de stock garantiza consistencia de datos
