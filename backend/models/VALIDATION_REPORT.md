# 📋 Reporte de Validación de Modelos

## ✅ Estado General
**14 archivos de modelos creados y validados**

---

## 🔧 Correcciones Aplicadas

### 1. ⏰ **Actualización de datetime.utcnow()**
**Problema:** `datetime.utcnow()` está deprecado en Python 3.12+
**Solución:** Cambiado a `datetime.now(timezone.utc)` usando lambdas

**Archivos corregidos:**
- ✅ `companies.py`
- ✅ `restaurants.py`
- ✅ `orders.py`
- ✅ `payments.py`
- ✅ `invoices.py`
- ✅ `invoice_corrections.py`

### 2. 🔗 **Índice Único Compuesto en Invoices**
**Problema:** Faltaba el índice único para `(invoice_series, invoice_number)`
**Solución:** Agregado `__table_args__` con `Index` único

```python
__table_args__ = (
    Index('idx_invoice_series_number', 'invoice_series', 'invoice_number', unique=True),
)
```

---

## ⚠️ Advertencias y Recomendaciones

### 1. 🔢 **Tipo Decimal en SQLModel**
**Estado:** ⚠️ Requiere atención

Los campos `Decimal` están definidos con:
```python
price: Decimal = Field(max_digits=10, decimal_places=2)
```

**Problema:** SQLModel no soporta `max_digits` y `decimal_places` directamente en `Field()`.

**Recomendaciones:**

#### Opción A: Usar SQLAlchemy Column (Recomendado)
```python
from sqlalchemy import Column, Numeric
from sqlmodel import Field

class ProductBase(SQLModel):
    price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
```

#### Opción B: Validación en Pydantic
```python
from pydantic import field_validator

class ProductBase(SQLModel):
    price: Decimal
    
    @field_validator('price')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price must be positive')
        return round(v, 2)
```

**Archivos afectados:**
- `tax_rates.py`
- `products.py`
- `order_items.py`
- `payments.py`
- `invoices.py`
- `invoice_items.py`
- `invoice_corrections.py`

---

## 📝 Resumen de Modelos Creados

### 🏢 Empresas y Restaurantes
1. ✅ **companies.py** - Empresas emisoras de facturas
   - Campos: legal_name, tax_id (único), fiscal_address, city, postal_code, country
   - Timestamps: created_at, updated_at

2. ✅ **restaurants.py** - Restaurantes/sucursales
   - FK: company_id → Companies
   - Campos: name, address, phone_number
   - Timestamps: created_at, updated_at

### 👥 Usuarios y Roles
3. ✅ **users.py** - Usuarios del sistema (Ya existía)
   - Campos: email (único), full_name, is_active, is_superuser, hashed_password

4. ✅ **roles.py** - Roles de usuario
   - Campos: name

5. ✅ **user_roles.py** - Asignación de roles (Tabla de unión)
   - PK Compuesta: (user_id, role_id, restaurant_id)
   - FKs: user_id, role_id, restaurant_id

### 💰 Impuestos y Productos
6. ✅ **tax_rates.py** - Tipos impositivos (IVA)
   - Campos: name, rate (Decimal), is_default

7. ✅ **categories.py** - Categorías de productos
   - FK: restaurant_id, parent_category_id (auto-referencia)
   - Campos: name

8. ✅ **products.py** - Productos del menú
   - FKs: category_id, tax_rate_id
   - Campos: name, description, price (Decimal), is_available

### 🍽️ Mesas y Pedidos
9. ✅ **restaurant_tables.py** - Mesas físicas
   - FK: restaurant_id
   - Campos: table_number, qr_code_identifier, status

10. ✅ **orders.py** - Pedidos
    - FK: restaurant_table_id
    - Campos: status
    - Timestamps: created_at, updated_at

11. ✅ **order_items.py** - Items de pedidos
    - FKs: order_id, product_id
    - Campos: quantity, unit_price (Decimal), notes

### 💳 Pagos y Facturas
12. ✅ **payments.py** - Pagos
    - FK: order_id
    - Campos: amount (Decimal), payment_method, transaction_id, status
    - Timestamp: payment_date

13. ✅ **invoices.py** - Facturas
    - FKs: company_id, payment_id
    - Campos: invoice_series, invoice_number, issue_date, operation_date
    - Campos cliente: customer_name, customer_tax_id, customer_address, etc.
    - Campos totales: total_base_amount, total_tax_amount, total_amount (Decimal)
    - Verifactu: verifactu_hash, qr_code_data
    - Índice único: (invoice_series, invoice_number)

14. ✅ **invoice_items.py** - Items de facturas
    - FK: invoice_id
    - Campos: product_description, quantity, unit_price_base (Decimal)
    - Campos calculados: discount_percentage, tax_rate_percentage, tax_amount, total_line_amount

15. ✅ **invoice_corrections.py** - Facturas rectificativas
    - FKs: original_invoice_id, corrective_invoice_id (único)
    - Campos: correction_reason_code, correction_type, reason_description
    - Campos montos: corrected_base_amount, corrected_tax_amount (Decimal)

---

## 🎯 Esquemas Implementados

Cada modelo incluye:

✅ **Base Schema** - Propiedades compartidas
✅ **Create Schema** - Para creación de recursos
✅ **Update Schema** - Para actualización (todos los campos opcionales)
✅ **Table Model** - Modelo de base de datos con `table=True`
✅ **Public Schema** - Para respuestas API (incluye id)
✅ **Public List Schema** - Para paginación (data + count)

---

## 🔗 Relaciones Foreign Key

### Jerarquía de Dependencias:
```
Companies
├── Restaurants
│   ├── Categories
│   │   └── Products
│   │       └── OrderItems
│   └── RestaurantTables
│       └── Orders
│           ├── OrderItems
│           └── Payments
│               └── Invoices
│                   ├── InvoiceItems
│                   └── InvoiceCorrections
│
TaxRates → Products

Roles + Users → UserRoles ← Restaurants
```

---

## 🚀 Próximos Pasos Recomendados

### 1. **Actualizar Decimal Fields** (Alta prioridad)
Modificar todos los campos `Decimal` para usar `sa_column` con `Column(Numeric(precision, scale))`.

### 2. **Crear archivo __init__.py**
Actualizar `/backend/models/__init__.py` para exportar todos los modelos:
```python
from .companies import Company, CompanyCreate, CompanyUpdate, CompanyPublic, CompaniesPublic
from .restaurants import Restaurant, RestaurantCreate, RestaurantUpdate, RestaurantPublic, RestaurantsPublic
# ... etc
```

### 3. **Crear Migraciones con Alembic**
```bash
alembic revision --autogenerate -m "Add all restaurant models"
alembic upgrade head
```

### 4. **Agregar Relationships**
Considerar agregar `Relationship` de SQLModel para facilitar navegación entre modelos:
```python
class Restaurant(RestaurantBase, table=True):
    company: "Company" = Relationship(back_populates="restaurants")
    tables: list["RestaurantTable"] = Relationship(back_populates="restaurant")
```

### 5. **Validaciones Adicionales**
- Validar formatos de email, teléfono, códigos postales
- Validar rangos de valores (precios > 0, porcentajes entre 0-100)
- Validar estados (enum para status fields)

### 6. **Índices Adicionales**
Considerar agregar índices en:
- `Companies.tax_id`
- `RestaurantTables.qr_code_identifier`
- `Orders.status` + `Orders.created_at`
- `Payments.status`
- `Invoices.issue_date`

---

## ✅ Conclusión

**Estado:** Los 14 modelos han sido creados correctamente con la estructura base.

**Correcciones aplicadas:** 
- ✅ Datetime deprecado corregido
- ✅ Índice único en facturas agregado

**Acción requerida:**
- ⚠️ Actualizar campos Decimal con `sa_column`
- 📝 Crear migraciones de base de datos
- 🔗 Considerar agregar Relationships entre modelos

---

**Fecha de validación:** 27 de octubre de 2025
