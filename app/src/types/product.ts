/**
 * Product & Order Management Types
 * Types matching backend models for products, categories, tax rates, orders and order items
 */

// ============================================
// Tasa Impositiva (Tax Rate) Types
// ============================================

export interface TasaImpositiva {
  id: string;
  nombre: string;
  porcentaje: number;
  descripcion?: string;
}

export interface TasaImpositivaCreate {
  nombre: string;
  porcentaje: number;
  descripcion?: string;
}

export interface TasaImpositivaUpdate {
  nombre?: string;
  porcentaje?: number;
  descripcion?: string;
}

export interface TasasImpositivasPublic {
  data: TasaImpositiva[];
  count: number;
}

// ============================================
// Categoria (Category) Types
// ============================================

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  restaurante_id: string;
  categoria_id?: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  restaurante_id: string;
  categoria_id?: string;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
  restaurante_id?: string;
  categoria_id?: string;
}

export interface CategoriasPublic {
  data: Categoria[];
  count: number;
}

// ============================================
// Producto (Product) Types
// ============================================

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria_id: string;
  restaurante_id: string;
  empresa_id: string;
  tasa_impositiva_id?: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria_id: string;
  restaurante_id: string;
  empresa_id: string;
  tasa_impositiva_id?: string;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  imagen?: string;
  categoria_id?: string;
  restaurante_id?: string;
  empresa_id?: string;
  tasa_impositiva_id?: string;
}

export interface ProductosPublic {
  data: Producto[];
  count: number;
}

export interface ProductoStockUpdate {
  stock: number;
}

// ============================================
// Orden (Order) Types
// ============================================

export type EstadoOrden = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

export interface Orden {
  id: string;
  fecha_orden: string; // ISO datetime string
  estado: EstadoOrden;
  total: number;
  notas?: string;
  restaurante_id: string;
  cliente_id?: string;
  mesa_id?: string;
}

export interface OrdenCreate {
  estado?: EstadoOrden;
  total?: number;
  notas?: string;
  restaurante_id: string;
  cliente_id?: string;
  mesa_id?: string;
}

export interface OrdenUpdate {
  estado?: EstadoOrden;
  total?: number;
  notas?: string;
  restaurante_id?: string;
  cliente_id?: string;
  mesa_id?: string;
}

export interface OrdenesPublic {
  data: Orden[];
  count: number;
}

export interface OrdenEstadoUpdate {
  estado: EstadoOrden;
}

// ============================================
// OrdenItem (Order Item) Types
// ============================================

export interface OrdenItem {
  id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  orden_id: string;
  producto_id: string;
}

export interface OrdenItemCreate {
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  notas?: string;
  orden_id: string;
  producto_id: string;
}

export interface OrdenItemUpdate {
  cantidad?: number;
  precio_unitario?: number;
  subtotal?: number;
  notas?: string;
  orden_id?: string;
  producto_id?: string;
}

export interface OrdenItemsPublic {
  data: OrdenItem[];
  count: number;
}

export interface OrdenItemCantidadUpdate {
  cantidad: number;
}
