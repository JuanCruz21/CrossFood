/**
 * Restaurantes Management Page
 * Complete CRUD interface for restaurant management with empresa filtering
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/ui/tables';
import { Modal, ConfirmDialog } from '@/ui/modal';
import { Button } from '@/ui/buttons';
import { Input } from '@/ui/input';
import { api, ApiError } from '@/lib/api';
import type { Restaurante, RestauranteCreate, RestauranteUpdate, Empresa } from '@/types/company';

export default function Restaurant() {
  // State
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRestaurante, setSelectedRestaurante] = useState<Restaurante | null>(null);
  const [formData, setFormData] = useState<RestauranteCreate>({
    nombre: '',
    empresa_id: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadRestaurantes();
    loadEmpresas();
  }, []);

  const loadRestaurantes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurantes/');
      setRestaurantes(response.data?.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await api.get('/empresas/');
      setEmpresas(response.data?.data || []);
    } catch (err) {
      console.error('Error loading empresas:', err);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      setError(null);
      await api.post('/restaurantes/', formData);
      setSuccess('Restaurante creado exitosamente');
      setModalOpen(false);
      resetForm();
      loadRestaurantes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear restaurante');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRestaurante) return;
    try {
      setError(null);
      const updateData: RestauranteUpdate = { ...formData };
      await api.patch(`/restaurantes/${selectedRestaurante.id}`, updateData);
      setSuccess('Restaurante actualizado exitosamente');
      setModalOpen(false);
      resetForm();
      loadRestaurantes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar restaurante');
    }
  };

  const handleDelete = async () => {
    if (!selectedRestaurante) return;
    try {
      setError(null);
      await api.delete(`/restaurantes/${selectedRestaurante.id}`);
      setSuccess('Restaurante eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedRestaurante(null);
      loadRestaurantes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar restaurante');
    }
  };

  // UI Handlers
  const openCreateModal = () => {
    resetForm();
    setSelectedRestaurante(null);
    setModalOpen(true);
  };

  const openEditModal = (restaurante: Restaurante) => {
    setSelectedRestaurante(restaurante);
    setFormData({
      nombre: restaurante.nombre,
      empresa_id: restaurante.empresa_id,
      direccion: restaurante.direccion || '',
      telefono: restaurante.telefono || '',
      email: restaurante.email || '',
    });
    setModalOpen(true);
  };

  const openDeleteDialog = (restaurante: Restaurante) => {
    setSelectedRestaurante(restaurante);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      empresa_id: '',
      direccion: '',
      telefono: '',
      email: '',
    });
    setSelectedRestaurante(null);
  };

  const getEmpresaNombre = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa?.nombre || 'N/A';
  };

  // Table Configuration
  const columns: Column<Restaurante>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (restaurante) => (
        <div className="font-medium text-[var(--foreground)]">
          {restaurante.nombre}
        </div>
      ),
    },
    {
      key: 'empresa_id',
      label: 'Empresa',
      render: (restaurante) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
          {getEmpresaNombre(restaurante.empresa_id)}
        </span>
      ),
    },
    {
      key: 'direccion',
      label: 'Dirección',
      render: (restaurante) => restaurante.direccion || '-',
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (restaurante) => restaurante.telefono || '-',
    },
    {
      key: 'email',
      label: 'Email',
      render: (restaurante) => restaurante.email ? (
        <a 
          href={`mailto:${restaurante.email}`}
          className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
        >
          {restaurante.email}
        </a>
      ) : '-',
    },
  ];

  const actions: TableAction<Restaurante>[] = [
    {
      label: 'Editar',
      onClick: openEditModal,
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
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Restaurantes Asociados</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Gestiona los restaurantes asociados a tu empresa desde aquí.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Nuevo Restaurante
        </Button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-200">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={restaurantes}
        columns={columns}
        actions={actions}
        loading={loading}
        searchPlaceholder="Buscar restaurantes..."
        emptyMessage="No hay restaurantes registrados"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedRestaurante ? 'Editar Restaurante' : 'Nuevo Restaurante'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedRestaurante ? handleUpdate : handleCreate}>
              {selectedRestaurante ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Restaurante *"
            type="text"
            placeholder="Ej: Sucursal Centro"
            value={formData.nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Empresa *
            </label>
            <select
              value={formData.empresa_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, empresa_id: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              required
            >
              <option value="">Seleccionar empresa...</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Dirección"
            type="text"
            placeholder="Calle 123 #45-67"
            value={formData.direccion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, direccion: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+57 300 123 4567"
              value={formData.telefono}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="restaurante@ejemplo.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar restaurante?"
        message={`¿Estás seguro de que deseas eliminar el restaurante "${selectedRestaurante?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}