/**
 * Permissions Management Page
 * Complete CRUD interface for permission management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/ui/tables';
import { Modal, ConfirmDialog } from '@/ui/modal';
import { Button } from '@/ui/buttons';
import { Input, TextArea } from '@/ui/input';
import { api, ApiError } from '@/lib/api';
import type { Permiso, PermisoCreate, PermisoUpdate, Rol, User } from '@/types/auth';

export default function Permissions() {
  // State
  const [permissions, setPermissions] = useState<Permiso[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permiso | null>(null);
  const [formData, setFormData] = useState<PermisoCreate>({
    nombre: '',
    descripcion: '',
  });
  const [permissionRoles, setPermissionRoles] = useState<Rol[]>([]);
  const [permissionUsers, setPermissionUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadPermissions();
    loadRoles();
    loadUsers();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/permisos/');
      // Backend devuelve { data: [...], count: ... }
      setPermissions(response.data?.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar permisos');
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

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/');
      // Backend devuelve { data: [...], count: ... }
      setUsers(response.data?.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadPermissionRoles = async (permisoId: string) => {
    try {
      // Note: Backend doesn't have a direct endpoint for this, so we need to check each role
      const rolesResponse = await api.get('/roles/');
      const allRoles = Array.isArray(rolesResponse.data) ? rolesResponse.data : (rolesResponse.data?.data || []);
      const rolesWithPermission: Rol[] = [];

      for (const role of allRoles) {
        const perms = await api.get(`/role-permisos/rol/${role.id}/permisos`);
        const permisos = Array.isArray(perms.data) ? perms.data : (perms.data?.data || []);
        const hasPermission = permisos.some((p: Permiso) => p.id === permisoId);
        if (hasPermission) {
          rolesWithPermission.push(role);
        }
      }

      setPermissionRoles(rolesWithPermission);
    } catch (err) {
      console.error('Error loading permission roles:', err);
    }
  };

  const loadPermissionUsers = async (permisoId: string) => {
    try {
      // Note: Backend doesn't have a direct endpoint for this, so we need to check each user
      const usersResponse = await api.get('/users/');
      const allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data?.data || []);
      const usersWithPermission: User[] = [];

      for (const user of allUsers) {
        const perms = await api.get(`/user-permisos/user/${user.id}/permisos/direct`);
        const permisos = Array.isArray(perms.data) ? perms.data : (perms.data?.data || []);
        const hasPermission = permisos.some((p: Permiso) => p.id === permisoId);
        if (hasPermission) {
          usersWithPermission.push(user);
        }
      }

      setPermissionUsers(usersWithPermission);
    } catch (err) {
      console.error('Error loading permission users:', err);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      setError(null);
      await api.post('/permisos/', formData);
      setSuccess('Permiso creado exitosamente');
      setModalOpen(false);
      resetForm();
      loadPermissions();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear permiso');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPermission) return;
    try {
      setError(null);
      const updateData: PermisoUpdate = { ...formData };
      await api.patch(`/permisos/${selectedPermission.id}`, updateData);
      setSuccess('Permiso actualizado exitosamente');
      setModalOpen(false);
      resetForm();
      loadPermissions();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar permiso');
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;
    try {
      setError(null);
      await api.delete(`/permisos/${selectedPermission.id}`);
      setSuccess('Permiso eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedPermission(null);
      loadPermissions();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar permiso');
    }
  };

  // Helpers
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
    });
    setSelectedPermission(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (permission: Permiso) => {
    setSelectedPermission(permission);
    setFormData({
      nombre: permission.nombre,
      descripcion: permission.descripcion || '',
    });
    setModalOpen(true);
  };

  const openRolesModal = async (permission: Permiso) => {
    setSelectedPermission(permission);
    await loadPermissionRoles(permission.id);
    setRolesModalOpen(true);
  };

  const openUsersModal = async (permission: Permiso) => {
    setSelectedPermission(permission);
    await loadPermissionUsers(permission.id);
    setUsersModalOpen(true);
  };

  const openDeleteDialog = (permission: Permiso) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };

  // Table configuration
  const columns: Column<Permiso>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (permission: Permiso) => (
        <span className="font-medium text-[var(--foreground)]">{permission.nombre}</span>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: false,
      render: (permission: Permiso) => (
        <span className="text-[var(--muted-foreground)]">{permission.descripcion || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (permission: Permiso) => new Date(permission.created_at).toLocaleDateString(),
    },
  ];

  const actions: TableAction<Permiso>[] = [
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
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Permisos del Sistema</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Gestiona los permisos disponibles en el sistema.
          </p>
        </div>
        <Button onClick={openCreateModal}>+ Nuevo Permiso</Button>
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
        data={permissions}
        columns={columns}
        actions={actions}
        loading={loading}
        searchPlaceholder="Buscar permisos..."
        emptyMessage="No hay permisos registrados"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedPermission ? 'Editar Permiso' : 'Nuevo Permiso'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedPermission ? handleUpdate : handleCreate}>
              {selectedPermission ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Permiso"
            type="text"
            placeholder="Ej: users.read, products.write, reports.delete"
            value={formData.nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <TextArea
            label="Descripción"
            placeholder="Describe qué permite hacer este permiso..."
            value={formData.descripcion}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <div className="p-3 bg-[var(--muted)] rounded-lg text-sm text-[var(--muted-foreground)]">
            <p className="font-medium mb-1">💡 Convención de nombres recomendada:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code>recurso.acción</code> - Ej: users.read, products.write</li>
              <li>Usar verbos en inglés: read, write, delete, update</li>
              <li>Ser específico y descriptivo</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Roles Modal */}
      <Modal
        isOpen={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        title={`Roles con el Permiso - ${selectedPermission?.nombre}`}
        size="lg"
      >
        <div className="space-y-2">
          {permissionRoles.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-4">
              No hay roles con este permiso asignado
            </p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {permissionRoles.map((role) => (
                <div key={role.id} className="py-3">
                  <div className="text-sm font-medium text-[var(--foreground)]">{role.nombre}</div>
                  {role.descripcion && (
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">{role.descripcion}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Users Modal */}
      <Modal
        isOpen={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        title={`Usuarios con el Permiso Directo - ${selectedPermission?.nombre}`}
        size="lg"
      >
        <div className="space-y-2">
          {permissionUsers.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-4">
              No hay usuarios con este permiso asignado directamente
            </p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {permissionUsers.map((user) => (
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
        title="Eliminar Permiso"
        message={`¿Estás seguro de que deseas eliminar el permiso "${selectedPermission?.nombre}"? Esta acción no se puede deshacer y puede afectar a roles y usuarios que lo tengan asignado.`}
        confirmText="Eliminar"
        variant="error"
      />
    </div>
  );
}
