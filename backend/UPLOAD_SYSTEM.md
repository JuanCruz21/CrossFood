# Sistema de Carga de Imágenes para Productos

## Implementación Completa

### Backend

#### 1. Endpoint de Upload (`/api/v1/upload/producto`)
- **POST** - Subir imagen de producto
  - Acepta: JPG, JPEG, PNG, GIF, WEBP
  - Tamaño máximo: 5MB
  - Retorna: `{ filename, url, size }`
  - URL relativa: `/uploads/productos/{uuid}.ext`

- **DELETE** `/api/v1/upload/producto/{filename}` - Eliminar imagen

#### 2. Servidor de Archivos Estáticos
- Las imágenes se sirven desde: `http://localhost:8000/uploads/productos/`
- Directorio: `/backend/uploads/productos/`

### Frontend

#### Características
1. **Input de archivo** con validación de tipo
2. **Previsualización** de imagen antes de subir
3. **Edición** - muestra imagen actual y permite cambiarla
4. **Renderizado** automático en tabla con URLs relativas o absolutas

#### Flujo de Trabajo
1. Usuario selecciona archivo → se muestra preview
2. Al crear/editar producto → se sube imagen primero
3. URL de imagen se guarda en base de datos
4. Imágenes se renderizan automáticamente en lista

### Estructura de Archivos

```
backend/
├── app/
│   ├── main.py (configuración de StaticFiles)
│   └── routes/
│       ├── main.py (registro de router upload)
│       └── upload.py (endpoint de carga)
└── uploads/
    ├── .gitignore
    └── productos/
        └── {uuid}.{ext}

app/
└── src/
    └── app/
        └── home/
            └── menu/
                └── products/
                    └── page.tsx (UI con carga de archivos)
```

### Uso

#### Crear Producto con Imagen
```typescript
1. Click en "Nuevo Producto"
2. Completar formulario
3. Seleccionar archivo de imagen
4. Ver preview
5. Click en "Crear Producto"
   → Imagen se sube automáticamente
   → URL se guarda en DB
```

#### Editar Imagen de Producto
```typescript
1. Click en "Editar" en producto
2. Ver imagen actual
3. Seleccionar nuevo archivo (opcional)
4. Click en "Guardar Cambios"
   → Nueva imagen se sube si fue seleccionada
   → URL se actualiza en DB
```

### Seguridad
- Validación de tipos de archivo (solo imágenes)
- Límite de tamaño (5MB)
- Nombres únicos (UUID) para evitar colisiones
- Autenticación requerida (Bearer token)

### Mejoras Futuras Posibles
- [ ] Compresión automática de imágenes
- [ ] Múltiples tamaños (thumbnails)
- [ ] CDN para producción
- [ ] Limpieza automática de imágenes huérfanas
- [ ] Editor de imágenes (crop, resize)
