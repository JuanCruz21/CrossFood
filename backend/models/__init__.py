# Importar todos los modelos para que SQLModel los reconozca
from models.users import User, UserCreate, UserPublic, UserUpdate
from models.companies import Company, CompanyCreate, CompanyUpdate, CompanyPublic
from models.restaurants import Restaurant, RestaurantCreate, RestaurantUpdate, RestaurantPublic
from models.roles import Role, RoleCreate, RoleUpdate, RolePublic
from models.user_roles import UserRole, UserRoleCreate, UserRoleUpdate, UserRolePublic
from models.tax_rates import TaxRate, TaxRateCreate, TaxRateUpdate, TaxRatePublic
from models.categories import Category, CategoryCreate, CategoryUpdate, CategoryPublic
from models.products import Product, ProductCreate, ProductUpdate, ProductPublic
from models.restaurant_tables import RestaurantTable, RestaurantTableCreate, RestaurantTableUpdate, RestaurantTablePublic
from models.orders import Order, OrderCreate, OrderUpdate, OrderPublic
from models.order_items import OrderItem, OrderItemCreate, OrderItemUpdate, OrderItemPublic
from models.payments import Payment, PaymentCreate, PaymentUpdate, PaymentPublic
from models.invoices import Invoice, InvoiceCreate, InvoiceUpdate, InvoicePublic
from models.invoice_items import InvoiceItem, InvoiceItemCreate, InvoiceItemUpdate, InvoiceItemPublic
from models.invoice_corrections import InvoiceCorrection, InvoiceCorrectionCreate, InvoiceCorrectionUpdate, InvoiceCorrectionPublic

__all__ = [
    # Users
    "User",
    "UserCreate",
    "UserUpdate",
    "UserPublic",
    # Companies
    "Company",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyPublic",
    # Restaurants
    "Restaurant",
    "RestaurantCreate",
    "RestaurantUpdate",
    "RestaurantPublic",
    # Roles
    "Role",
    "RoleCreate",
    "RoleUpdate",
    "RolePublic",
    # UserRoles
    "UserRole",
    "UserRoleCreate",
    "UserRoleUpdate",
    "UserRolePublic",
    # TaxRates
    "TaxRate",
    "TaxRateCreate",
    "TaxRateUpdate",
    "TaxRatePublic",
    # Categories
    "Category",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryPublic",
    # Products
    "Product",
    "ProductCreate",
    "ProductUpdate",
    "ProductPublic",
    # RestaurantTables
    "RestaurantTable",
    "RestaurantTableCreate",
    "RestaurantTableUpdate",
    "RestaurantTablePublic",
    # Orders
    "Order",
    "OrderCreate",
    "OrderUpdate",
    "OrderPublic",
    # OrderItems
    "OrderItem",
    "OrderItemCreate",
    "OrderItemUpdate",
    "OrderItemPublic",
    # Payments
    "Payment",
    "PaymentCreate",
    "PaymentUpdate",
    "PaymentPublic",
    # Invoices
    "Invoice",
    "InvoiceCreate",
    "InvoiceUpdate",
    "InvoicePublic",
    # InvoiceItems
    "InvoiceItem",
    "InvoiceItemCreate",
    "InvoiceItemUpdate",
    "InvoiceItemPublic",
    # InvoiceCorrections
    "InvoiceCorrection",
    "InvoiceCorrectionCreate",
    "InvoiceCorrectionUpdate",
    "InvoiceCorrectionPublic",
]

