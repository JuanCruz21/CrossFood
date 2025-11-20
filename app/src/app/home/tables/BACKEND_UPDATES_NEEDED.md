# Ajustes Necesarios en el Backend

## ⚠️ Modelo de Orden Actualizado

Para soportar completamente el flujo de pedidos, el modelo `Orden` en el backend necesita los siguientes ajustes:

### 📝 Cambios Requeridos

**Archivo: `/backend/models/product/orden.py`**

```python
import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class OrdenBase(SQLModel):
    fecha: str  # Mantener como está
    total: float  # Mantener como está
    estado: str = Field(default="borrador")  # ✅ Cambiar default de "pendiente" a "borrador"
    mesa_id: uuid.UUID | None = Field(foreign_key="mesarestaurante.id")
    cliente_id: uuid.UUID = Field(foreign_key="user.id")
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")
    
    # ✅ AGREGAR NUEVOS CAMPOS
    numero_comensales: int | None = None  # Número de personas en la mesa
    mesero_id: uuid.UUID | None = Field(foreign_key="user.id", default=None)  # ID del mesero
    notas: str | None = None  # Notas adicionales

class OrdenCreate(OrdenBase):
    # Hacer fecha opcional en creación (se puede generar automáticamente)
    fecha: str = Field(default_factory=lambda: datetime.now().isoformat())

class OrdenUpdate(SQLModel):
    fecha: str | None = None
    total: float | None = None  # ✅ Cambiar de float a float | None
    estado: str | None = None
    mesa_id: uuid.UUID | None = None
    cliente_id: uuid.UUID | None = None
    restaurante_id: uuid.UUID | None = None
    numero_comensales: int | None = None  # ✅ AGREGAR
    mesero_id: uuid.UUID | None = None  # ✅ AGREGAR
    notas: str | None = None  # ✅ AGREGAR

class Orden(OrdenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class OrdenPublic(OrdenBase):
    id: uuid.UUID

class OrdenesPublic(SQLModel):
    data: list[OrdenPublic]
    count: int
```

### 🔄 Migración de Base de Datos

Después de modificar el modelo, ejecutar:

```bash
cd backend
alembic revision --autogenerate -m "add_numero_comensales_and_mesero_to_orden"
alembic upgrade head
```

### 📊 Modelo de Mesa Restaurante

**Archivo: `/backend/models/company/mesarestaurante.py`**

```python
import uuid
from sqlmodel import Field, SQLModel

class MesaRestauranteBase(SQLModel):
    numero_mesa: int = Field(index=True)
    capacidad: int
    restaurante_id: uuid.UUID = Field(foreign_key="restaurante.id")
    
    # ✅ AGREGAR NUEVOS CAMPOS
    estado: str = Field(default="disponible")  # disponible, ocupada, reservada
    orden_activa_id: uuid.UUID | None = Field(foreign_key="orden.id", default=None)
    numero_comensales: int | None = None
    tiempo_ocupacion: str | None = None  # ISO datetime

class MesaRestauranteCreate(MesaRestauranteBase):
    pass

class MesaRestauranteUpdate(SQLModel):
    numero_mesa: int | None = None
    capacidad: int | None = None
    restaurante_id: uuid.UUID | None = None
    estado: str | None = None  # ✅ AGREGAR
    orden_activa_id: uuid.UUID | None = None  # ✅ AGREGAR
    numero_comensales: int | None = None  # ✅ AGREGAR
    tiempo_ocupacion: str | None = None  # ✅ AGREGAR

class MesaRestaurante(MesaRestauranteBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class MesaRestaurantePublic(MesaRestauranteBase):
    id: uuid.UUID

class MesaRestaurantesPublic(SQLModel):
    data: list[MesaRestaurantePublic]
    count: int
```

### 🔧 Endpoints Adicionales Necesarios

#### 1. Actualizar estado de mesa

```python
@router.patch("/mesas/{mesa_id}/estado")
async def actualizar_estado_mesa(
    mesa_id: uuid.UUID,
    estado: str,
    orden_activa_id: uuid.UUID | None = None,
    numero_comensales: int | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Actualizar estado de una mesa"""
    mesa = session.get(MesaRestaurante, mesa_id)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    
    mesa.estado = estado
    mesa.orden_activa_id = orden_activa_id
    mesa.numero_comensales = numero_comensales
    
    if estado == "ocupada":
        mesa.tiempo_ocupacion = datetime.now().isoformat()
    elif estado == "disponible":
        mesa.tiempo_ocupacion = None
    
    session.add(mesa)
    session.commit()
    session.refresh(mesa)
    
    return mesa
```

#### 2. Obtener órdenes activas por mesa

```python
@router.get("/ordenes/mesa/{mesa_id}/activa")
async def obtener_orden_activa_mesa(
    mesa_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Obtener orden activa de una mesa"""
    statement = select(Orden).where(
        Orden.mesa_id == mesa_id,
        Orden.estado.in_(["borrador", "activo"])
    )
    orden = session.exec(statement).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="No hay orden activa para esta mesa")
    
    return orden
```

## 🗃️ Modelos de Modificadores (Opcional pero Recomendado)

**Archivo: `/backend/models/product/modificador.py`**

```python
import uuid
from sqlmodel import Field, SQLModel, Relationship

class ModificadorBase(SQLModel):
    nombre: str
    tipo: str  # "obligatorio" o "opcional"
    producto_id: uuid.UUID = Field(foreign_key="producto.id")

class ModificadorCreate(ModificadorBase):
    pass

class ModificadorUpdate(SQLModel):
    nombre: str | None = None
    tipo: str | None = None
    producto_id: uuid.UUID | None = None

class Modificador(ModificadorBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    opciones: list["ModificadorOpcion"] = Relationship(back_populates="modificador")

class ModificadorPublic(ModificadorBase):
    id: uuid.UUID
    opciones: list["ModificadorOpcionPublic"] = []

# Opciones de Modificador
class ModificadorOpcionBase(SQLModel):
    nombre: str
    precio_adicional: float = Field(default=0.0)
    modificador_id: uuid.UUID = Field(foreign_key="modificador.id")

class ModificadorOpcionCreate(ModificadorOpcionBase):
    pass

class ModificadorOpcionUpdate(SQLModel):
    nombre: str | None = None
    precio_adicional: float | None = None
    modificador_id: uuid.UUID | None = None

class ModificadorOpcion(ModificadorOpcionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    modificador: Modificador | None = Relationship(back_populates="opciones")

class ModificadorOpcionPublic(ModificadorOpcionBase):
    id: uuid.UUID

class ModificadoresPublic(SQLModel):
    data: list[ModificadorPublic]
    count: int
```

## 📝 Modelo OrdenItem Actualizado

**Archivo: `/backend/models/product/ordenitem.py`**

```python
import uuid
from sqlmodel import Field, SQLModel

class OrdenItemBase(SQLModel):
    orden_id: uuid.UUID = Field(foreign_key="orden.id")
    producto_id: uuid.UUID = Field(foreign_key="producto.id")
    cantidad: int
    precio_unitario: float
    subtotal: float  # ✅ Cambiar de notas: str a subtotal calculado
    notas: str | None = None  # ✅ Mover notas como opcional

class OrdenItemCreate(OrdenItemBase):
    pass

class OrdenItemUpdate(SQLModel):
    cantidad: int | None = None
    precio_unitario: float | None = None
    subtotal: float | None = None
    notas: str | None = None

class OrdenItem(OrdenItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class OrdenItemPublic(OrdenItemBase):
    id: uuid.UUID

class OrdenItemsPublic(SQLModel):
    data: list[OrdenItemPublic]
    count: int
```

## 🚀 Orden de Implementación

1. ✅ **Actualizar modelo Orden** - Agregar campos nuevos
2. ✅ **Actualizar modelo MesaRestaurante** - Agregar estado y campos relacionados
3. ✅ **Actualizar modelo OrdenItem** - Ajustar estructura
4. ⚙️ **Crear migración de base de datos**
5. ⚙️ **Ejecutar migración**
6. 🔧 **Actualizar endpoints** - Agregar endpoints de actualización de estado
7. 🎯 **Implementar modificadores** (opcional)
8. 🧪 **Probar flujo completo**

## 📌 Notas Importantes

- Actualmente, `numero_comensales` se guarda en el campo `notas` de la orden como workaround
- Una vez actualices el backend, el frontend ya está preparado para usar los campos correctos
- Los modificadores están implementados en el frontend pero necesitan backend completo
- El sistema de destino (cocina/bar) está basado en la categoría del producto - considera agregar un campo `tipo` al modelo Producto

## 🔗 Estados Válidos

### Estados de Orden
- `borrador` - Orden en construcción
- `activo` - Orden enviada a cocina/bar
- `completado` - Orden servida y pagada
- `cancelado` - Orden cancelada

### Estados de Mesa
- `disponible` - Mesa libre
- `ocupada` - Mesa con orden activa
- `reservada` - Mesa con reservación

---

**Una vez implementados estos cambios en el backend, el sistema funcionará completamente** ✅
