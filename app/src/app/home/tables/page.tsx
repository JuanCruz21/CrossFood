'use client';

import React from 'react';

export default function TablesPage() {
  const tables = [
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
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium">
          + Nueva Mesa
        </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const statusInfo = getStatusInfo(table.status);
          return (
            <div
              key={table.id}
              className={`bg-[var(--card)] border-2 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer ${statusInfo.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">Mesa {table.number}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {table.capacity} personas
                  </p>
                </div>
                {statusInfo.icon}
              </div>

              <div className="space-y-3">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.badgeColor}`}>
                  {statusInfo.label}
                </div>

                {table.status === 'occupied' && (
                  <>
                    <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                      <span>Comensales</span>
                      <span className="font-medium text-[var(--foreground)]">{table.customers}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                      <span>Pedido</span>
                      <span className="font-medium text-[var(--foreground)]">#{table.order}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[var(--border)]">
                      <button className="w-full py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                        Ver Pedido
                      </button>
                    </div>
                  </>
                )}

                {table.status === 'available' && (
                  <div className="pt-3 mt-3 border-t border-[var(--border)]">
                    <button className="w-full py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                      Asignar Mesa
                    </button>
                  </div>
                )}

                {table.status === 'reserved' && (
                  <div className="pt-3 mt-3 border-t border-[var(--border)]">
                    <button className="w-full py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                      Ver Reserva
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
