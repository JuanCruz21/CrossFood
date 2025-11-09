/**
 * Auth & User Management Types
 * Types matching backend models for users, roles, and permissions
 */

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

// ============================================
// Role Types
// ============================================

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface RolCreate {
  nombre: string;
  descripcion?: string;
}

export interface RolUpdate {
  nombre?: string;
  descripcion?: string;
}

export interface RolUser {
  id: string;
  user_id: string;
  rol_id: string;
  created_at: string;
}

// ============================================
// Permission Types
// ============================================

export interface Permiso {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface PermisoCreate {
  nombre: string;
  descripcion?: string;
}

export interface PermisoUpdate {
  nombre?: string;
  descripcion?: string;
}

export interface PermisoRol {
  id: string;
  permiso_id: string;
  rol_id: string;
  created_at: string;
}

export interface PermisoUsuario {
  id: string;
  permiso_id: string;
  user_id: string;
  created_at: string;
}

// ============================================
// Extended Types with Relations
// ============================================

export interface UserWithRoles extends User {
  roles?: Rol[];
  permisos_directos?: Permiso[];
  permisos_totales?: Permiso[];
}

export interface RolWithPermissions extends Rol {
  permisos?: Permiso[];
  users_count?: number;
}

export interface PermisoWithRelations extends Permiso {
  roles?: Rol[];
  users_directos?: User[];
}

// ============================================
// Request/Response Types
// ============================================

export interface AssignRolRequest {
  user_id: string;
  rol_id: string;
}

export interface RemoveRolRequest {
  user_id: string;
  rol_id: string;
}

export interface AssignPermisoToRolRequest {
  rol_id: string;
  permiso_id: string;
}

export interface AssignPermisoToUserRequest {
  user_id: string;
  permiso_id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ============================================
// Filter & Sort Types
// ============================================

export interface UserFilters {
  search?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  rol_id?: string;
  page?: number;
  size?: number;
  sort_by?: 'email' | 'full_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface RolFilters {
  search?: string;
  page?: number;
  size?: number;
  sort_by?: 'nombre' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface PermisoFilters {
  search?: string;
  page?: number;
  size?: number;
  sort_by?: 'nombre' | 'created_at';
  sort_order?: 'asc' | 'desc';
}
