'use client';

import React, { useState } from 'react';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Button } from 'app/ui/buttons';

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'occupied' | 'available' | 'reserved';
  customers: number;
  order: number | null;
}

export default function TablesPage() {
  const addTablePopup = usePopup();
  const editTablePopup = usePopup();
  const deleteTablePopup = usePopup();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const tables: Table[] = [
    { id: 1, number: 1, capacity: 4, status: 'occupied', customers: 3, order: 45 },
    { id: 2, number: 2, capacity: 2, status: 'available', customers: 0, order: null },
    { id: 3, number: 3, capacity: 6, status: 'occupied', customers: 5, order: 98 },
    { id: 4, number: 4, capacity: 4, status: 'reserved', customers: 0, order: null },
    { id: 5, number: 5, capacity: 4, status: 'occupied', customers: 4, order: 101 },
    { id: 6, number: 6, capacity: 2, status: 'available', customers: 0, order: null },
    { id: 7, number: 7, capacity: 8, status: 'occupied', customers: 7, order: 99 },
    { id: 8, number: 8, capacity: 4, status: 'available', customers: 0, order: null },
    { id: 9, number: 9, capacity: 2, status: 'occupied', customers: 2, order: 102 },
    { id: 10, number: 10, capacity: 4, status: 'available', customers: 0, order: null },
    { id: 11, number: 11, capacity: 6, status: 'reserved', customers: 0, order: null },
    { id: 12, number: 12, capacity: 4, status: 'occupied', customers: 3, order: 100 },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return {
          label: 'Disponible',
          borderColor: 'border-green-500/30',
          badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-400',
          icon: (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'occupied':
        return {
          label: 'Ocupada',
          borderColor: 'border-red-500/30',
          badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400',
          icon: (
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        };
      case 'reserved':
        return {
          label: 'Reservada',
          borderColor: 'border-blue-500/30',
          badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          icon: (
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        };
      default:
        return {
          label: 'Desconocido',
          borderColor: 'border-gray-500/30',
          badgeColor: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
          icon: null,
        };
    }
  };

  const stats = {
    total: tables.length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    available: tables.filter((t) => t.status === 'available').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Gestión de Mesas</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Vista general del estado de las mesas del restaurante
          </p>
        </div>
        <Button 
          onClick={addTablePopup.open}
          variant="primary"
        >
          + Nueva Mesa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Mesas</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{stats.total}</p>
        </div>
        <div className="bg-[var(--card)] border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Disponibles</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{stats.available}</p>
        </div>
        <div className="bg-[var(--card)] border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Ocupadas</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{stats.occupied}</p>
        </div>
        <div className="bg-[var(--card)] border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">Reservadas</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{stats.reserved}</p>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const statusInfo = getStatusInfo(table.status);
          return (
            <div
              key={table.id}
              className={`group relative bg-[var(--card)] border-2 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${statusInfo.borderColor}`}
            >
              {/* Header con gradiente sutil */}
              <div className="relative p-6 pb-4">
                {/* Número de mesa grande y centrado */}
                <div className="text-center mb-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--muted)] to-[var(--card)] border border-[var(--border)] mb-3">
                    <span className="text-2xl font-bold text-[var(--foreground)]">{table.number}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{table.capacity} personas</span>
                  </div>
                </div>

                {/* Badge de estado */}
                <div className="flex justify-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.badgeColor}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </div>
                </div>
              </div>

              {/* Detalles e información */}
              <div className="px-6 pb-6">
                {table.status === 'occupied' && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]/30">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Comensales</span>
                      </div>
                      <span className="font-semibold text-[var(--foreground)]">{table.customers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]/30">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>Pedido</span>
                      </div>
                      <span className="font-semibold text-[var(--foreground)]">#{table.order}</span>
                    </div>
                  </div>
                )}

                {table.status === 'reserved' && (
                  <div className="mb-4 space-y-2">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
                      <div className="relative flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">Reserva Confirmada</p>
                          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">Mesa reservada y lista para recibir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {table.status === 'available' && (
                  <div className="mb-4 space-y-2">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
                      <div className="relative flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="font-semibold text-sm text-green-700 dark:text-green-300">Disponible Ahora</p>
                          <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-0.5">Lista para asignar clientes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedTable(table);
                      editTablePopup.open();
                    }}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>
                  
                  {table.status === 'occupied' && (
                    <Button
                      onClick={() => {
                        setSelectedTable(table);
                        deleteTablePopup.open();
                      }}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Liberar
                    </Button>
                  )}
                  
                  {table.status === 'available' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Asignar
                    </Button>
                  )}
                  
                  {table.status === 'reserved' && (
                    <Button
                      onClick={() => {
                        setSelectedTable(table);
                        deleteTablePopup.open();
                      }}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {/* Indicador visual en hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          );
        })}
      </div>

      {/* Popup: Nueva Mesa */}
      <Popup
        isOpen={addTablePopup.isOpen}
        onClose={addTablePopup.close}
        title="Nueva Mesa"
        description="Crea una nueva mesa para el restaurante"
        onConfirm={async () => {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Nueva mesa creada');
          setIsLoading(false);
          addTablePopup.close();
        }}
        confirmText="Crear Mesa"
        isLoading={isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Número de Mesa
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="1"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Capacidad (personas)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="4"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Ubicación (opcional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="Ej: Terraza, Interior, VIP"
            />
          </div>
        </div>
      </Popup>

      {/* Popup: Editar Mesa */}
      <Popup
        isOpen={editTablePopup.isOpen}
        onClose={editTablePopup.close}
        title={`Editar Mesa ${selectedTable?.number || ''}`}
        description="Modifica los datos de la mesa"
        onConfirm={async () => {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Mesa actualizada:', selectedTable);
          setIsLoading(false);
          editTablePopup.close();
        }}
        confirmText="Guardar Cambios"
        isLoading={isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Número de Mesa
            </label>
            <input
              type="number"
              defaultValue={selectedTable?.number}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Capacidad (personas)
            </label>
            <input
              type="number"
              defaultValue={selectedTable?.capacity}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Estado
            </label>
            <select
              defaultValue={selectedTable?.status}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="available">Disponible</option>
              <option value="occupied">Ocupada</option>
              <option value="reserved">Reservada</option>
            </select>
          </div>
        </div>
      </Popup>

      {/* Popup: Confirmación de Liberación/Cancelación */}
      <AlertPopup
        isOpen={deleteTablePopup.isOpen}
        onClose={deleteTablePopup.close}
        onConfirm={() => {
          console.log('Mesa liberada/cancelada:', selectedTable);
          deleteTablePopup.close();
        }}
        type="warning"
        title={selectedTable?.status === 'occupied' ? '¿Liberar mesa?' : '¿Cancelar reserva?'}
        message={
          selectedTable?.status === 'occupied'
            ? 'La mesa se marcará como disponible. Asegúrate de que el pedido haya sido pagado.'
            : 'La reserva será cancelada y la mesa quedará disponible.'
        }
        confirmText="Sí, continuar"
        cancelText="Cancelar"
      />
    </div>
  );
}
