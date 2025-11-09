/**
 * Roles Management Page
 * Complete CRUD interface for role management with permission assignment
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/ui/tables';
import { Modal, ConfirmDialog } from '@/ui/modal';
import { Button } from '@/ui/buttons';
import { Input, TextArea } from '@/ui/input';
import { api, ApiError } from '@/lib/api';
import type { Rol, RolCreate, RolUpdate, Permiso, User } from '@/types/auth';

export default function Roles() {
  // State
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permissions, setPermissions] = useState<Permiso[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
  const [formData, setFormData] = useState<RolCreate>({
    nombre: '',
    descripcion: '',
  });
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadRoles();
    loadPermissions();
    loadUsers();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles/');
      // Backend devuelve { data: [...], count: ... }
      setRoles(response.data?.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar roles');
    } finally {
      setLoading(false);
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

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/');
      // Backend devuelve { data: [...], count: ... }
      setUsers(response.data?.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadRolePermissions = async (roleId: string) => {
    try {
      const response = await api.get(`/role-permisos/rol/${roleId}/permisos`);
      // Puede devolver array directo o { data: [...] }
      const permisos = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setRolePermissions(permisos.map((p: Permiso) => p.id));
    } catch (err) {
      console.error('Error loading role permissions:', err);
    }
  };

  const loadRoleUsers = async (roleId: string) => {
    try {
      const response = await api.get(`/user-roles/rol/${roleId}/users`);
      // Puede devolver array directo o { data: [...] }
      setRoleUsers(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (err) {
      console.error('Error loading role users:', err);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      setError(null);
      await api.post('/roles/', formData);
      setSuccess('Rol creado exitosamente');
      setModalOpen(false);
      resetForm();
      loadRoles();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear rol');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    try {
      setError(null);
      const updateData: RolUpdate = { ...formData };
      await api.patch(`/roles/${selectedRole.id}`, updateData);
      setSuccess('Rol actualizado exitosamente');
      setModalOpen(false);
      resetForm();
      loadRoles();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar rol');
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      setError(null);
      await api.delete(`/roles/${selectedRole.id}`);
      setSuccess('Rol eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      loadRoles();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar rol');
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;
    try {
      setError(null);
      // Get current permissions
      const currentResponse = await api.get(`/role-permisos/rol/${selectedRole.id}/permisos`);
      const permisos = Array.isArray(currentResponse.data) ? currentResponse.data : (currentResponse.data?.data || []);
      const currentPermissionIds = permisos.map((p: Permiso) => p.id);

      // Remove permissions that are no longer selected
      for (const permissionId of currentPermissionIds) {
        if (!rolePermissions.includes(permissionId)) {
          await api.post('/role-permisos/remove', { rol_id: selectedRole.id, permiso_id: permissionId });
        }
      }

      // Add new permissions
      for (const permissionId of rolePermissions) {
        if (!currentPermissionIds.includes(permissionId)) {
          await api.post('/role-permisos/assign', { rol_id: selectedRole.id, permiso_id: permissionId });
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
      nombre: '',
      descripcion: '',
    });
    setSelectedRole(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (role: Rol) => {
    setSelectedRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || '',
    });
    setModalOpen(true);
  };

  const openPermissionsModal = async (role: Rol) => {
    setSelectedRole(role);
    await loadRolePermissions(role.id);
    setPermissionsModalOpen(true);
  };

  const openUsersModal = async (role: Rol) => {
    setSelectedRole(role);
    await loadRoleUsers(role.id);
    setUsersModalOpen(true);
  };

  const openDeleteDialog = (role: Rol) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  // Table configuration
  const columns: Column<Rol>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (role: Rol) => (
        <span className="font-medium text-[var(--foreground)]">{role.nombre}</span>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: false,
      render: (role: Rol) => (
        <span className="text-[var(--muted-foreground)]">{role.descripcion || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (role: Rol) => new Date(role.created_at).toLocaleDateString(),
    },
  ];

  const actions: TableAction<Rol>[] = [
    {
      label: 'Editar',
      onClick: openEditModal,
      variant: 'ghost',
    },
    {
      label: 'Permisos',
      onClick: openPermissionsModal,
      variant: 'ghost',
    },
    {
      label: 'Usuarios',
      onClick: openUsersModal,
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
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Roles del Sistema</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Gestiona los roles y sus permisos desde aquí.
          </p>
        </div>
        <Button onClick={openCreateModal}>+ Nuevo Rol</Button>
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
        data={roles}
        columns={columns}
        actions={actions}
        loading={loading}
        searchPlaceholder="Buscar roles..."
        emptyMessage="No hay roles registrados"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedRole ? 'Editar Rol' : 'Nuevo Rol'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedRole ? handleUpdate : handleCreate}>
              {selectedRole ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Rol"
            type="text"
            placeholder="Ej: Administrador, Editor, Visualizador"
            value={formData.nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <TextArea
            label="Descripción"
            placeholder="Describe las responsabilidades de este rol..."
            value={formData.descripcion}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        title={`Gestionar Permisos - ${selectedRole?.nombre}`}
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
          {permissions.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-4">
              No hay permisos disponibles
            </p>
          ) : (
            permissions.map((permission) => (
              <label key={permission.id} className="flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePermissions.includes(permission.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRolePermissions([...rolePermissions, permission.id]);
                    } else {
                      setRolePermissions(rolePermissions.filter((id) => id !== permission.id));
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
            ))
          )}
        </div>
      </Modal>

      {/* Users Modal */}
      <Modal
        isOpen={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        title={`Usuarios con el Rol - ${selectedRole?.nombre}`}
        size="lg"
      >
        <div className="space-y-2">
          {roleUsers.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-4">
              No hay usuarios asignados a este rol
            </p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {roleUsers.map((user) => (
                <div key={user.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">{user.full_name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{user.email}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.is_active
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : 'bg-[var(--error)]/10 text-[var(--error)]'
                    }`}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${selectedRole?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="error"
      />
    </div>
  );
}
