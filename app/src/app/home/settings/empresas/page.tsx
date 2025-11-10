/**
 * Empresas Management Page
 * Complete CRUD interface for company management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/ui/tables';
import { Modal, ConfirmDialog } from '@/ui/modal';
import { Button } from '@/ui/buttons';
import { Input } from '@/ui/input';
import { api, ApiError } from '@/lib/api';
import type { Empresa, EmpresaCreate, EmpresaUpdate } from '@/types/company';

export default function Empresas() {
  // State
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState<EmpresaCreate>({
    nombre: '',
    direccion: '',
    ciudad: '',
    email: '',
    telefono: '',
    postal_code: '',
    pais: '',
    sitio_web: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/empresas/');
      setEmpresas(response.data?.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      setError(null);
      await api.post('/empresas/', formData);
      setSuccess('Empresa creada exitosamente');
      setModalOpen(false);
      resetForm();
      loadEmpresas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear empresa');
    }
  };

  const handleUpdate = async () => {
    if (!selectedEmpresa) return;
    try {
      setError(null);
      const updateData: EmpresaUpdate = { ...formData };
      await api.patch(`/empresas/${selectedEmpresa.id}`, updateData);
      setSuccess('Empresa actualizada exitosamente');
      setModalOpen(false);
      resetForm();
      loadEmpresas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar empresa');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmpresa) return;
    try {
      setError(null);
      await api.delete(`/empresas/${selectedEmpresa.id}`);
      setSuccess('Empresa eliminada exitosamente');
      setDeleteDialogOpen(false);
      setSelectedEmpresa(null);
      loadEmpresas();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar empresa');
    }
  };

  // UI Handlers
  const openCreateModal = () => {
    resetForm();
    setSelectedEmpresa(null);
    setModalOpen(true);
  };

  const openEditModal = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setFormData({
      nombre: empresa.nombre,
      direccion: empresa.direccion,
      ciudad: empresa.ciudad,
      email: empresa.email,
      telefono: empresa.telefono || '',
      postal_code: empresa.postal_code || '',
      pais: empresa.pais || '',
      sitio_web: empresa.sitio_web || '',
    });
    setModalOpen(true);
  };

  const openDeleteDialog = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      email: '',
      telefono: '',
      postal_code: '',
      pais: '',
      sitio_web: '',
    });
    setSelectedEmpresa(null);
  };

  // Table Configuration
  const columns: Column<Empresa>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (empresa) => (
        <div className="font-medium text-[var(--foreground)]">
          {empresa.nombre}
        </div>
      ),
    },
    {
      key: 'ciudad',
      label: 'Ciudad',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      render: (empresa) => (
        <a 
          href={`mailto:${empresa.email}`}
          className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
        >
          {empresa.email}
        </a>
      ),
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (empresa) => empresa.telefono || '-',
    },
    {
      key: 'pais',
      label: 'País',
      render: (empresa) => empresa.pais || '-',
    },
  ];

  const actions: TableAction<Empresa>[] = [
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
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Gestión de Empresas</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Administra las empresas del sistema
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Nueva Empresa
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
        data={empresas}
        columns={columns}
        actions={actions}
        loading={loading}
        searchPlaceholder="Buscar empresas..."
        emptyMessage="No hay empresas registradas"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedEmpresa ? handleUpdate : handleCreate}>
              {selectedEmpresa ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la Empresa *"
            type="text"
            placeholder="Ej: Restaurantes XYZ"
            value={formData.nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              placeholder="empresa@ejemplo.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+57 300 123 4567"
              value={formData.telefono}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>

          <Input
            label="Dirección *"
            type="text"
            placeholder="Calle 123 #45-67"
            value={formData.direccion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, direccion: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Ciudad *"
              type="text"
              placeholder="Bogotá"
              value={formData.ciudad}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ciudad: e.target.value })}
              required
            />
            <Input
              label="País"
              type="text"
              placeholder="Colombia"
              value={formData.pais}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pais: e.target.value })}
            />
            <Input
              label="Código Postal"
              type="text"
              placeholder="110111"
              value={formData.postal_code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, postal_code: e.target.value })}
            />
          </div>

          <Input
            label="Sitio Web"
            type="url"
            placeholder="https://www.ejemplo.com"
            value={formData.sitio_web}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sitio_web: e.target.value })}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar empresa?"
        message={`¿Estás seguro de que deseas eliminar la empresa "${selectedEmpresa?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
