"""
Sistema de Permisos - Definiciones y Utilidades

Este archivo define los permisos disponibles en el sistema siguiendo el formato:
    recurso.accion

Ejemplos:
    - rol.read: Leer roles
    - rol.write: Crear/modificar roles
    - rol.delete: Eliminar roles
    - user.read: Leer usuarios
    - user.write: Crear/modificar usuarios
"""

# ============================================
# Permisos de Roles
# ============================================
ROL_READ = "rol.read"
ROL_WRITE = "rol.write"
ROL_DELETE = "rol.delete"

# ============================================
# Permisos de Usuarios
# ============================================
USER_READ = "user.read"
USER_WRITE = "user.write"
USER_DELETE = "user.delete"

# ============================================
# Permisos de Permisos (meta-permisos)
# ============================================
PERMISSION_READ = "permission.read"
PERMISSION_WRITE = "permission.write"
PERMISSION_DELETE = "permission.delete"

# ============================================
# Permisos de Empresas
# ============================================
EMPRESA_READ = "empresa.read"
EMPRESA_WRITE = "empresa.write"
EMPRESA_DELETE = "empresa.delete"

# ============================================
# Permisos de Restaurantes
# ============================================
RESTAURANTE_READ = "restaurante.read"
RESTAURANTE_WRITE = "restaurante.write"
RESTAURANTE_DELETE = "restaurante.delete"

# ============================================
# Permisos de Mesas
# ============================================
MESA_READ = "mesa.read"
MESA_WRITE = "mesa.write"
MESA_DELETE = "mesa.delete"

# ============================================
# Permisos de Órdenes
# ============================================
ORDER_READ = "order.read"
ORDER_WRITE = "order.write"
ORDER_DELETE = "order.delete"

# ============================================
# Permisos de Productos
# ============================================
PRODUCT_READ = "product.read"
PRODUCT_WRITE = "product.write"
PRODUCT_DELETE = "product.delete"

# ============================================
# Permisos de Facturas
# ============================================
BILL_READ = "bill.read"
BILL_WRITE = "bill.write"
BILL_DELETE = "bill.delete"

# ============================================
# Permisos de Categorías
# ============================================
CATEGORIA_READ = "categoria.read"
CATEGORIA_WRITE = "categoria.write"
CATEGORIA_DELETE = "categoria.delete"

# ============================================
# Permisos de Tasa Impositiva
# ============================================
TASA_IMPOSITIVA_READ = "tasa_impositiva.read"
TASA_IMPOSITIVA_WRITE = "tasa_impositiva.write"
TASA_IMPOSITIVA_DELETE = "tasa_impositiva.delete"

# =============================================
# Permisos de Items de Orden
# =============================================
ORDER_ITEM_READ = "order_item.read"
ORDER_ITEM_WRITE = "order_item.write"
ORDER_ITEM_DELETE = "order_item.delete"


# ============================================
# Grupos de Permisos
# ============================================

# Todos los permisos de administración
ADMIN_PERMISSIONS = [
    ROL_READ, ROL_WRITE, ROL_DELETE,
    USER_READ, USER_WRITE, USER_DELETE,
    PERMISSION_READ, PERMISSION_WRITE, PERMISSION_DELETE,
    EMPRESA_READ, EMPRESA_WRITE, EMPRESA_DELETE,
    RESTAURANTE_READ, RESTAURANTE_WRITE, RESTAURANTE_DELETE,
    MESA_READ, MESA_WRITE, MESA_DELETE,
    ORDER_READ, ORDER_WRITE, ORDER_DELETE,
    PRODUCT_READ, PRODUCT_WRITE, PRODUCT_DELETE,
    BILL_READ, BILL_WRITE, BILL_DELETE,
]

# Permisos básicos de lectura
READ_ALL_PERMISSIONS = [
    ROL_READ, USER_READ, PERMISSION_READ,
    EMPRESA_READ, RESTAURANTE_READ, MESA_READ,
    ORDER_READ, PRODUCT_READ, BILL_READ,
]

# Permisos de operación de restaurante
RESTAURANT_OPERATION_PERMISSIONS = [
    MESA_READ, MESA_WRITE,
    ORDER_READ, ORDER_WRITE,
    PRODUCT_READ,
    BILL_READ, BILL_WRITE,
]

# Permisos de gerente
MANAGER_PERMISSIONS = [
    USER_READ,
    RESTAURANTE_READ, RESTAURANTE_WRITE,
    MESA_READ, MESA_WRITE, MESA_DELETE,
    ORDER_READ, ORDER_WRITE,
    PRODUCT_READ, PRODUCT_WRITE,
    BILL_READ, BILL_WRITE,
]


def get_all_permissions() -> list[str]:
    """Obtener lista de todos los permisos definidos"""
    return [
        # Roles
        ROL_READ, ROL_WRITE, ROL_DELETE,
        # Usuarios
        USER_READ, USER_WRITE, USER_DELETE,
        # Permisos
        PERMISSION_READ, PERMISSION_WRITE, PERMISSION_DELETE,
        # Empresas
        EMPRESA_READ, EMPRESA_WRITE, EMPRESA_DELETE,
        # Restaurantes
        RESTAURANTE_READ, RESTAURANTE_WRITE, RESTAURANTE_DELETE,
        # Mesas
        MESA_READ, MESA_WRITE, MESA_DELETE,
        # Órdenes
        ORDER_READ, ORDER_WRITE, ORDER_DELETE,
        # Productos
        PRODUCT_READ, PRODUCT_WRITE, PRODUCT_DELETE,
        # Facturas
        BILL_READ, BILL_WRITE, BILL_DELETE,
        # Categorias
        CATEGORIA_READ, CATEGORIA_WRITE, CATEGORIA_DELETE,
    ]


def get_permission_description(permission: str) -> str:
    """Obtener descripción legible de un permiso"""
    descriptions = {
        # Roles
        ROL_READ: "Leer y listar roles",
        ROL_WRITE: "Crear y modificar roles",
        ROL_DELETE: "Eliminar roles",
        # Usuarios
        USER_READ: "Leer y listar usuarios",
        USER_WRITE: "Crear y modificar usuarios",
        USER_DELETE: "Eliminar usuarios",
        # Permisos
        PERMISSION_READ: "Leer y listar permisos",
        PERMISSION_WRITE: "Crear y modificar permisos",
        PERMISSION_DELETE: "Eliminar permisos",
        # Empresas
        EMPRESA_READ: "Leer y listar empresas",
        EMPRESA_WRITE: "Crear y modificar empresas",
        EMPRESA_DELETE: "Eliminar empresas",
        # Restaurantes
        RESTAURANTE_READ: "Leer y listar restaurantes",
        RESTAURANTE_WRITE: "Crear y modificar restaurantes",
        RESTAURANTE_DELETE: "Eliminar restaurantes",
        # Mesas
        MESA_READ: "Leer y listar mesas",
        MESA_WRITE: "Crear y modificar mesas",
        MESA_DELETE: "Eliminar mesas",
        # Órdenes
        ORDER_READ: "Leer y listar órdenes",
        ORDER_WRITE: "Crear y modificar órdenes",
        ORDER_DELETE: "Eliminar órdenes",
        # Productos
        PRODUCT_READ: "Leer y listar productos",
        PRODUCT_WRITE: "Crear y modificar productos",
        PRODUCT_DELETE: "Eliminar productos",
        # Facturas
        BILL_READ: "Leer y listar facturas",
        BILL_WRITE: "Crear y modificar facturas",
        BILL_DELETE: "Eliminar facturas",
    }
    return descriptions.get(permission, f"Permiso: {permission}")
