/**
 * API Configuration and Global HTTP Request Handler
 * Centralizes all backend communication with error handling, auth, and type safety
 */

// API Base URL - configurable through environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Standard API Response structure
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * HTTP Request Options
 */
export interface RequestOptions extends RequestInit {
  useAuth?: boolean;
  contentType?: string;
  timeout?: number;
}

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Store authentication token
 */
export const setAuthToken = (token: string, remember: boolean = false): void => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

/**
 * Remove authentication token
 */
export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};

/**
 * Global HTTP Request Handler
 * Handles all API requests with authentication, error handling, and timeout
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    useAuth = true,
    contentType = 'application/json',
    timeout = 30000,
    headers = {},
    ...fetchOptions
  } = options;

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Build headers
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Add Content-Type if not FormData
  if (contentType && !(fetchOptions.body instanceof FormData)) {
    requestHeaders['Content-Type'] = contentType;
  }

  // Add Authorization header if needed
  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-OK responses
    if (!response.ok) {
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      throw new ApiError(
        data?.message || data?.error || `Error HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      message: data?.message,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tiempo de espera agotado', 408);
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError('Error de red. Por favor, verifica tu conexión.', 0);
    }

    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown error
    throw new ApiError(
      error instanceof Error ? error.message : 'Error inesperado, por favor intente nuevamente.',
      500
    );
  }
}

/**
 * Convenience methods for common HTTP methods
 */

export const api = {
  /**
   * GET request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * PUT request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * PATCH request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * DELETE request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Upload file(s) with progress tracking
 */
export async function uploadFile(
  endpoint: string,
  file: File | File[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalData?: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> {
  const formData = new FormData();

  if (Array.isArray(file)) {
    file.forEach((f, index) => {
      formData.append(`files[${index}]`, f);
    });
  } else {
    formData.append('file', file);
  }

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
  }

  // Use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ data, status: xhr.status });
          } catch {
            resolve({ data: xhr.responseText, status: xhr.status });
          }
        } else {
          reject(new ApiError(`Upload failed with status ${xhr.status}`, xhr.status));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0));
      });

      xhr.open('POST', url);

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  // Standard fetch for files without progress tracking
  return api.post(endpoint, formData, { contentType: '' });
}

/**
 * Query string builder utility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================
// Product & Order API Functions
// ============================================

import type {
  TasaImpositiva,
  TasaImpositivaCreate,
  TasaImpositivaUpdate,
  TasasImpositivasPublic,
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
  CategoriasPublic,
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductosPublic,
  ProductoStockUpdate,
  Orden,
  OrdenCreate,
  OrdenUpdate,
  OrdenesPublic,
  OrdenEstadoUpdate,
  OrdenItem,
  OrdenItemCreate,
  OrdenItemUpdate,
  OrdenItemsPublic,
  OrdenItemCantidadUpdate,
  OrdenItemDetallado,
  EstadoOrden,
} from '../types/product';
import type {
  Restaurante,
  RestaurantesPublic,
  Empresa,
  EmpresasPublic,
  MesaRestaurante,
} from '../types/company';

// ============================================
// Tasa Impositiva (Tax Rate) API Functions
// ============================================

/**
 * Get all tax rates
 */
export async function getTasasImpositivas(
  skip: number = 0,
  limit: number = 100
): Promise<ApiResponse<TasasImpositivasPublic>> {
  const params = buildQueryString({ skip, limit });
  return api.get<TasasImpositivasPublic>(`/tasas-impositivas${params}`);
}

/**
 * Get a specific tax rate by ID
 */
export async function getTasaImpositiva(id: string): Promise<ApiResponse<TasaImpositiva>> {
  return api.get<TasaImpositiva>(`/tasas-impositivas/${id}`);
}

/**
 * Create a new tax rate
 */
export async function createTasaImpositiva(
  data: TasaImpositivaCreate
): Promise<ApiResponse<TasaImpositiva>> {
  return api.post<TasaImpositiva>('/tasas-impositivas', data);
}

/**
 * Update a tax rate
 */
export async function updateTasaImpositiva(
  id: string,
  data: TasaImpositivaUpdate
): Promise<ApiResponse<TasaImpositiva>> {
  return api.patch<TasaImpositiva>(`/tasas-impositivas/${id}`, data);
}

/**
 * Delete a tax rate
 */
export async function deleteTasaImpositiva(id: string): Promise<ApiResponse<{ ok: boolean }>> {
  return api.delete<{ ok: boolean }>(`/tasas-impositivas/${id}`);
}

// ============================================
// Categoria (Category) API Functions
// ============================================

/**
 * Get all categories with optional restaurant filter
 */
export async function getCategorias(
  restauranteId?: string,
  skip: number = 0,
  limit: number = 100
): Promise<ApiResponse<CategoriasPublic>> {
  const params = buildQueryString({ restaurante_id: restauranteId, skip, limit });
  return api.get<CategoriasPublic>(`/categorias${params}`);
}

/**
 * Get a specific category by ID
 */
export async function getCategoria(id: string): Promise<ApiResponse<Categoria>> {
  return api.get<Categoria>(`/categorias/${id}`);
}

/**
 * Create a new category
 */
export async function createCategoria(data: CategoriaCreate): Promise<ApiResponse<Categoria>> {
  return api.post<Categoria>('/categorias', data);
}

/**
 * Update a category
 */
export async function updateCategoria(
  id: string,
  data: CategoriaUpdate
): Promise<ApiResponse<Categoria>> {
  return api.patch<Categoria>(`/categorias/${id}`, data);
}

/**
 * Delete a category
 */
export async function deleteCategoria(id: string): Promise<ApiResponse<{ ok: boolean }>> {
  return api.delete<{ ok: boolean }>(`/categorias/${id}`);
}

// ============================================
// Empresa & Restaurante API Functions
// ============================================

/**
 * Get all restaurantes (respecting user permissions)
 */
export async function getRestaurantes(
  skip: number = 0,
  limit: number = 100
): Promise<ApiResponse<RestaurantesPublic>> {
  const params = buildQueryString({ skip, limit });
  return api.get<RestaurantesPublic>(`/restaurantes${params}`);
}

/**
 * Get all restaurantes by empresa
 */
export async function getRestaurantesByEmpresa(
  empresaId: string,
  skip: number = 0,
  limit: number = 100
): Promise<ApiResponse<RestaurantesPublic>> {
  const params = buildQueryString({ skip, limit });
  return api.get<RestaurantesPublic>(`/restaurantes/empresa/${empresaId}${params}`);
}

/**
 * Get a specific restaurante by ID
 */
export async function getRestaurante(id: string): Promise<ApiResponse<Restaurante>> {
  return api.get<Restaurante>(`/restaurantes/${id}`);
}

// ============================================
// Mesa Restaurante API Functions
// ============================================

/**
 * Asignar una orden a una mesa
 */
export async function asignarOrdenAMesa(
  mesaId: string,
  ordenId: string,
  numeroComensales: number
): Promise<ApiResponse<MesaRestaurante>> {
  const params = buildQueryString({
    orden_id: ordenId,
    numero_comensales: numeroComensales,
  });
  return api.patch<MesaRestaurante>(`/mesas/${mesaId}/asignar-orden${params}`);
}

/**
 * Liberar una mesa (remover orden y cambiar estado a disponible)
 */
export async function liberarMesa(mesaId: string): Promise<ApiResponse<MesaRestaurante>> {
  return api.patch<MesaRestaurante>(`/mesas/${mesaId}/liberar`);
}

/**
 * Cambiar el estado de una mesa
 */
export async function cambiarEstadoMesa(
  mesaId: string,
  nuevoEstado: 'disponible' | 'ocupada' | 'reservada'
): Promise<ApiResponse<MesaRestaurante>> {
  const params = buildQueryString({ nuevo_estado: nuevoEstado });
  return api.patch<MesaRestaurante>(`/mesas/${mesaId}/estado${params}`);
}

// ============================================
// Producto (Product) API Functions
// ============================================

/**
 * Get all products with optional filters
 */
export async function getProductos(filters?: {
  restauranteId?: string;
  categoriaId?: string;
  empresaId?: string;
  skip?: number;
  limit?: number;
}): Promise<ApiResponse<ProductosPublic>> {
  const params = buildQueryString({
    restaurante_id: filters?.restauranteId,
    categoria_id: filters?.categoriaId,
    empresa_id: filters?.empresaId,
    skip: filters?.skip ?? 0,
    limit: filters?.limit ?? 100,
  });
  return api.get<ProductosPublic>(`/productos${params}`);
}

/**
 * Get a specific product by ID
 */
export async function getProducto(id: string): Promise<ApiResponse<Producto>> {
  return api.get<Producto>(`/productos/${id}`);
}

/**
 * Create a new product
 */
export async function createProducto(data: ProductoCreate): Promise<ApiResponse<Producto>> {
  return api.post<Producto>('/productos', data);
}

/**
 * Update a product
 */
export async function updateProducto(
  id: string,
  data: ProductoUpdate
): Promise<ApiResponse<Producto>> {
  return api.patch<Producto>(`/productos/${id}`, data);
}

/**
 * Update product stock
 */
export async function updateProductoStock(
  id: string,
  stock: number
): Promise<ApiResponse<Producto>> {
  return api.patch<Producto>(`/productos/${id}/stock`, { stock } as ProductoStockUpdate);
}

/**
 * Delete a product
 */
export async function deleteProducto(id: string): Promise<ApiResponse<{ ok: boolean }>> {
  return api.delete<{ ok: boolean }>(`/productos/${id}`);
}

// ============================================
// Orden (Order) API Functions
// ============================================

/**
 * Get all orders with optional filters
 */
export async function getOrdenes(filters?: {
  restauranteId?: string;
  clienteId?: string;
  mesaId?: string;
  estado?: EstadoOrden;
  skip?: number;
  limit?: number;
}): Promise<ApiResponse<OrdenesPublic>> {
  const params = buildQueryString({
    restaurante_id: filters?.restauranteId,
    cliente_id: filters?.clienteId,
    mesa_id: filters?.mesaId,
    estado: filters?.estado,
    skip: filters?.skip ?? 0,
    limit: filters?.limit ?? 100,
  });
  return api.get<OrdenesPublic>(`/ordenes${params}`);
}

/**
 * Get a specific order by ID
 */
export async function getOrden(id: string): Promise<ApiResponse<Orden>> {
  return api.get<Orden>(`/ordenes/${id}`);
}

/**
 * Get active orders for a restaurant (pendiente, en_proceso, completada)
 */
export async function getOrdenesActivas(restauranteId: string, filters?: {
  skip?: number;
  limit?: number;
}): Promise<ApiResponse<{ data: Orden[]; count: number }>> {
  const params = buildQueryString({
    skip: filters?.skip ?? 0,
    limit: filters?.limit ?? 100,
  });
  return api.get<{ data: Orden[]; count: number }>(`/ordenes/activas/restaurante/${restauranteId}${params}`);
}

/**
 * Get all items for a specific order with detailed product information
 */
export async function getOrdenItemsDetallados(ordenId: string): Promise<ApiResponse<{ data: OrdenItemDetallado[]; count: number }>> {
  return api.get<{ data: OrdenItemDetallado[]; count: number }>(`/ordenes/${ordenId}/items`);
}

/**
 * Create a new order
 */
export async function createOrden(data: OrdenCreate): Promise<ApiResponse<Orden>> {
  return api.post<Orden>('/ordenes', data);
}

/**
 * Update an order
 */
export async function updateOrden(id: string, data: OrdenUpdate): Promise<ApiResponse<Orden>> {
  return api.patch<Orden>(`/ordenes/${id}`, data);
}

/**
 * Update order status
 */
export async function updateOrdenEstado(
  id: string,
  estado: EstadoOrden
): Promise<ApiResponse<Orden>> {
  return api.patch<Orden>(`/ordenes/${id}/estado`, { estado } as OrdenEstadoUpdate);
}

/**
 * Delete an order
 */
export async function deleteOrden(id: string): Promise<ApiResponse<{ ok: boolean }>> {
  return api.delete<{ ok: boolean }>(`/ordenes/${id}`);
}

// ============================================
// OrdenItem (Order Item) API Functions
// ============================================

/**
 * Get all order items with optional order filter
 */
export async function getOrdenItems(
  ordenId?: string,
  skip: number = 0,
  limit: number = 100
): Promise<ApiResponse<OrdenItemsPublic>> {
  const params = buildQueryString({ orden_id: ordenId, skip, limit });
  return api.get<OrdenItemsPublic>(`/orden-items${params}`);
}

/**
 * Get a specific order item by ID
 */
export async function getOrdenItem(id: string): Promise<ApiResponse<OrdenItem>> {
  return api.get<OrdenItem>(`/orden-items/${id}`);
}

/**
 * Create a new order item (automatically reduces product stock)
 */
export async function createOrdenItem(data: OrdenItemCreate): Promise<ApiResponse<OrdenItem>> {
  return api.post<OrdenItem>('/orden-items', data);
}

/**
 * Update an order item (adjusts product stock accordingly)
 */
export async function updateOrdenItem(
  id: string,
  data: OrdenItemUpdate
): Promise<ApiResponse<OrdenItem>> {
  return api.patch<OrdenItem>(`/orden-items/${id}`, data);
}

/**
 * Update order item quantity (adjusts product stock accordingly)
 */
export async function updateOrdenItemCantidad(
  id: string,
  cantidad: number
): Promise<ApiResponse<OrdenItem>> {
  return api.patch<OrdenItem>(`/orden-items/${id}/cantidad`, {
    cantidad,
  } as OrdenItemCantidadUpdate);
}

/**
 * Delete an order item (restores product stock)
 */
export async function deleteOrdenItem(id: string): Promise<ApiResponse<{ ok: boolean }>> {
  return api.delete<{ ok: boolean }>(`/orden-items/${id}`);
}

/**
 * Delete all items for a specific order (restores product stock for all items)
 */
export async function deleteOrdenItemsByOrden(ordenId: string): Promise<ApiResponse<{ ok: boolean }>> {
  return api.delete<{ ok: boolean }>(`/orden-items/orden/${ordenId}`);
}

/**
 * Example usage:
 * 
 * // Simple GET
 * const { data, error } = await api.get('/users');
 * 
 * // POST with data
 * const { data } = await api.post('/auth/login', { email, password });
 * 
 * // With query params
 * const params = buildQueryString({ page: 1, limit: 10, search: 'test' });
 * const { data } = await api.get(`/products${params}`);
 * 
 * // File upload with progress
 * await uploadFile('/upload', file, { category: 'images' }, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * 
 * // Without auth
 * const { data } = await api.get('/public/info', { useAuth: false });
 * 
 * // Custom timeout
 * const { data } = await api.get('/slow-endpoint', { timeout: 60000 });
 * 
 * // Product & Order API examples:
 * 
 * // Get products filtered by restaurant
 * const { data: products } = await getProductos({ restauranteId: '123', empresaId: '456' });
 * 
 * // Create a category
 * const { data: category } = await createCategoria({
 *   nombre: 'Bebidas',
 *   descripcion: 'Bebidas frías y calientes',
 *   restaurante_id: '123'
 * });
 * 
 * // Update product stock
 * const { data: product } = await updateProductoStock('prod-123', 50);
 * 
 * // Get pending orders
 * const { data: orders } = await getOrdenes({ restauranteId: '123', estado: 'pendiente' });
 * 
 * // Create order item (stock is automatically reduced)
 * const { data: item } = await createOrdenItem({
 *   cantidad: 2,
 *   precio_unitario: 10.50,
 *   orden_id: 'order-123',
 *   producto_id: 'prod-456'
 * });
 */
