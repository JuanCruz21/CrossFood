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
// Modificadores de Productos
// ============================================

export interface ModificadorOpcion {
  id: string;
  nombre: string;
  precio_adicional?: number;
}

export interface Modificador {
  id: string;
  nombre: string;
  tipo: 'obligatorio' | 'opcional';
  opciones: ModificadorOpcion[];
  producto_id: string;
}

export interface ProductoConModificadores extends Producto {
  modificadores?: Modificador[];
}

export interface ModificadorSeleccionado {
  modificador_id: string;
  opcion_id: string;
  nombre_modificador: string;
  nombre_opcion: string;
  precio_adicional: number;
}

// ============================================
// Orden (Order) Types
// ============================================

export type EstadoOrden = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
export type EstadoMesa = 'disponible' | 'ocupada' | 'reservada';

export interface Orden {
  id: string;
  fecha: string; // ISO datetime string
  estado: EstadoOrden;
  total: number;
  numero_comensales?: number;
  mesa_id?: string;
  cliente_id: string;
  restaurante_id: string;
  items?: OrdenItemDetallado[];
  total_items?: number;
  mesa_numero?: number;
}

export interface OrdenItemDetallado {
  id: string;
  orden_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  notas: string;
  producto_nombre?: string;
  producto_descripcion?: string;
}

export interface OrdenCreate {
  fecha: string;
  total: number;
  estado?: EstadoOrden;
  numero_comensales?: number;
  mesa_id?: string;
  cliente_id: string;
  restaurante_id: string;
}

export interface OrdenUpdate {
  fecha: string;
  total: number;
  estado?: string;
  mesa_id?: string;
  cliente_id?: string;
  restaurante_id?: string;
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
  modificadores?: ModificadorSeleccionado[];
}

export interface OrdenItemConProducto extends OrdenItem {
  producto?: Producto;
  destino?: 'cocina' | 'bar';
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

// ============================================
// Comanda (KOT - Kitchen Order Ticket) Types
// ============================================

export interface ComandaItem {
  producto: string;
  cantidad: number;
  modificadores?: string[];
  notas?: string;
}

export interface Comanda {
  id: string;
  orden_id: string;
  mesa_numero: number;
  fecha_hora: string;
  destino: 'cocina' | 'bar';
  items: ComandaItem[];
  numero_comensales?: number;
  mesero?: string;
}

export interface ComandaCreate {
  orden_id: string;
  destino: 'cocina' | 'bar';
  items: ComandaItem[];
}
