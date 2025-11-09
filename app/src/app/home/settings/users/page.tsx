/**
 * Users Management Page
 * Complete CRUD interface for user management with roles and permissions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/ui/tables';
import { Modal, ConfirmDialog } from '@/ui/modal';
import { Button } from '@/ui/buttons';
import { Input } from '@/ui/input';
import { api, ApiError } from '@/lib/api';
import type { User, UserCreate, UserUpdate, Rol, Permiso } from '@/types/auth';

export default function Users() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permissions, setPermissions] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    password: '',
    full_name: '',
    is_active: true,
    is_superuser: false,
  });
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadUsers();
    loadRoles();
    loadPermissions();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      // Backend devuelve { data: [...], count: ... }
      setUsers(response.data?.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles/');
      // Backend devuelve { data: [...], count: ... }
      setRoles(response.data?.data || []);
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await api.get('/permisos/');
      // Backend devuelve { data: [...], count: ... }
      setPermissions(response.data?.data || []);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const loadUserRoles = async (userId: string) => {
    try {
      const response = await api.get(`/user-roles/user/${userId}/roles`);
      // Puede devolver array directo o { data: [...] }
      const roles = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUserRoles(roles.map((r: Rol) => r.id));
    } catch (err) {
      console.error('Error loading user roles:', err);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      const response = await api.get(`/user-permisos/user/${userId}/permisos/direct`);
      // Puede devolver array directo o { data: [...] }
      const permisos = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUserPermissions(permisos.map((p: Permiso) => p.id));
    } catch (err) {
      console.error('Error loading user permissions:', err);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      setError(null);
      await api.post('/users/', formData);
      setSuccess('Usuario creado exitosamente');
      setModalOpen(false);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear usuario');
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      setError(null);
      const updateData: UserUpdate = { ...formData };
      if (!updateData.password) delete updateData.password;
      await api.patch(`/users/${selectedUser.id}`, updateData);
      setSuccess('Usuario actualizado exitosamente');
      setModalOpen(false);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar usuario');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setError(null);
      await api.delete(`/users/${selectedUser.id}`);
      setSuccess('Usuario eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar usuario');
    }
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;
    try {
      setError(null);
      // Get current roles
      const currentResponse = await api.get(`/user-roles/user/${selectedUser.id}/roles`);
      const roles = Array.isArray(currentResponse.data) ? currentResponse.data : (currentResponse.data?.data || []);
      const currentRoleIds = roles.map((r: Rol) => r.id);

      // Remove roles that are no longer selected
      for (const roleId of currentRoleIds) {
        if (!userRoles.includes(roleId)) {
          await api.post('/user-roles/remove', { user_id: selectedUser.id, rol_id: roleId });
        }
      }

      // Add new roles
      for (const roleId of userRoles) {
        if (!currentRoleIds.includes(roleId)) {
          await api.post('/user-roles/assign', { user_id: selectedUser.id, rol_id: roleId });
        }
      }

      setSuccess('Roles actualizados exitosamente');
      setRolesModalOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar roles');
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedUser) return;
    try {
      setError(null);
      // Get current permissions
      const currentResponse = await api.get(`/user-permisos/user/${selectedUser.id}/permisos/direct`);
      const permisos = Array.isArray(currentResponse.data) ? currentResponse.data : (currentResponse.data?.data || []);
      const currentPermissionIds = permisos.map((p: Permiso) => p.id);

      // Remove permissions that are no longer selected
      for (const permissionId of currentPermissionIds) {
        if (!userPermissions.includes(permissionId)) {
          await api.post('/user-permisos/remove', { user_id: selectedUser.id, permiso_id: permissionId });
        }
      }

      // Add new permissions
      for (const permissionId of userPermissions) {
        if (!currentPermissionIds.includes(permissionId)) {
          await api.post('/user-permisos/assign', { user_id: selectedUser.id, permiso_id: permissionId });
        }
      }

      setSuccess('Permisos actualizados exitosamente');
      setPermissionsModalOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar permisos');
    }
  };

  // Helpers
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      is_active: true,
      is_superuser: false,
    });
    setSelectedUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
    });
    setModalOpen(true);
  };

  const openRolesModal = async (user: User) => {
    setSelectedUser(user);
    await loadUserRoles(user.id);
    setRolesModalOpen(true);
  };

  const openPermissionsModal = async (user: User) => {
    setSelectedUser(user);
    await loadUserPermissions(user.id);
    setPermissionsModalOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Table configuration
  const columns: Column<User>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'full_name',
      label: 'Nombre Completo',
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Estado',
      sortable: true,
      render: (user) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            user.is_active
              ? 'bg-[var(--success)]/10 text-[var(--success)]'
              : 'bg-[var(--error)]/10 text-[var(--error)]'
          }`}
        >
          {user.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'is_superuser',
      label: 'Superusuario',
      sortable: true,
      render: (user) => (
        <span>{user.is_superuser ? '✓' : '-'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
  ];

  const actions: TableAction<User>[] = [
    {
      label: 'Editar',
      onClick: openEditModal,
      variant: 'ghost',
    },
    {
      label: 'Roles',
      onClick: openRolesModal,
      variant: 'ghost',
    },
    {
      label: 'Permisos',
      onClick: openPermissionsModal,
      variant: 'ghost',
    },
    {
      label: 'Eliminar',
      onClick: openDeleteDialog,
      variant: 'ghost',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Usuarios Asociados</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Gestiona los usuarios asociados a tu empresa desde aquí.
          </p>
        </div>
        <Button onClick={openCreateModal}>+ Nuevo Usuario</Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-lg text-[var(--error)]">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-[var(--success)]/10 border border-[var(--success)] rounded-lg text-[var(--success)]">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        loading={loading}
        searchPlaceholder="Buscar usuarios..."
        emptyMessage="No hay usuarios registrados"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedUser ? handleUpdate : handleCreate}>
              {selectedUser ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label={selectedUser ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Nombre Completo"
            type="text"
            placeholder="Juan Pérez"
            value={formData.full_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
              />
              <span className="text-sm text-[var(--foreground)]">Usuario Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_superuser}
                onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
              />
              <span className="text-sm text-[var(--foreground)]">Superusuario</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Roles Modal */}
      <Modal
        isOpen={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        title={`Gestionar Roles - ${selectedUser?.full_name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRolesModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignRoles}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={userRoles.includes(role.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setUserRoles([...userRoles, role.id]);
                  } else {
                    setUserRoles(userRoles.filter((id) => id !== role.id));
                  }
                }}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
              />
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">{role.nombre}</div>
                {role.descripcion && (
                  <div className="text-xs text-[var(--muted-foreground)]">{role.descripcion}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        title={`Gestionar Permisos Directos - ${selectedUser?.full_name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPermissionsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignPermissions}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-2">
          {permissions.map((permission) => (
            <label key={permission.id} className="flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={userPermissions.includes(permission.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setUserPermissions([...userPermissions, permission.id]);
                  } else {
                    setUserPermissions(userPermissions.filter((id) => id !== permission.id));
                  }
                }}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
              />
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">{permission.nombre}</div>
                {permission.descripcion && (
                  <div className="text-xs text-[var(--muted-foreground)]">{permission.descripcion}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${selectedUser?.full_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="error"
      />
    </div>
  );
}