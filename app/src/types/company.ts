/**
 * Company & Restaurant Management Types
 * Types matching backend models for empresas, restaurantes, and mesas
 */

// ============================================
// Empresa Types
// ============================================

export interface Empresa {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  ciudad: string;
  email: string;
  postal_code?: string;
  pais?: string;
  tasa_impositiva?: string;
  fecha_fundacion?: string;
  sitio_web?: string;
  logo?: string;
  [key: string]: unknown;
}

export interface EmpresaCreate {
  nombre: string;
  direccion: string;
  telefono?: string;
  ciudad: string;
  email: string;
  postal_code?: string;
  pais?: string;
  tasa_impositiva?: string;
  fecha_fundacion?: string;
  sitio_web?: string;
  logo?: string;
}

export interface EmpresaUpdate {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  pais?: string;
  ciudad?: string;
  postal_code?: string;
  tasa_impositiva?: string;
  fecha_fundacion?: string;
  sitio_web?: string;
  logo?: string;
}

export interface EmpresasPublic {
  data: Empresa[];
  count: number;
}

// ============================================
// Restaurante Types
// ============================================

export interface Restaurante {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  empresa_id: string;
  [key: string]: unknown;
}

export interface RestauranteCreate {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  empresa_id: string;
}

export interface RestauranteUpdate {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  empresa_id?: string;
}

export interface RestaurantesPublic {
  data: Restaurante[];
  count: number;
}

// ============================================
// Mesa Restaurante Types
// ============================================

export interface MesaRestaurante {
  id: string;
  numero_mesa: number;
  capacidad: number;
  restaurante_id: string;
  estado?: 'disponible' | 'ocupada' | 'reservada';
  orden_activa_id?: string;
  numero_comensales?: number;
  tiempo_ocupacion?: string; // ISO datetime when occupied
  [key: string]: unknown;
}

export interface MesaRestauranteCreate {
  numero_mesa: number;
  capacidad: number;
  restaurante_id: string;
}

export interface MesaRestauranteUpdate {
  numero_mesa?: number;
  capacidad?: number;
  restaurante_id?: string;
  estado?: 'disponible' | 'ocupada' | 'reservada';
  orden_activa_id?: string | null;
  numero_comensales?: number | null;
}

export interface MesaRestaurantesPublic {
  data: MesaRestaurante[];
  count: number;
}
