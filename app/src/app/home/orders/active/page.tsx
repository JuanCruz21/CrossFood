'use client';

import React from 'react';

export default function ActiveOrdersPage() {
  const orders = [
    { id: 1, table: 'Mesa 5', time: '10 min', items: 3, total: 45.50, status: 'Preparando' },
    { id: 2, table: 'Mesa 12', time: '5 min', items: 2, total: 32.00, status: 'Nuevo' },
    { id: 3, table: 'Mesa 8', time: '15 min', items: 5, total: 67.80, status: 'Listo' },
    { id: 4, table: 'Mesa 3', time: '8 min', items: 4, total: 52.20, status: 'Preparando' },
    { id: 5, table: 'Mesa 15', time: '3 min', items: 2, total: 28.50, status: 'Nuevo' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nuevo':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Preparando':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'Listo':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Pedidos Activos</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Gestiona los pedidos en proceso
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium">
          + Nuevo Pedido
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Pedidos Nuevos</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">2</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">En Preparación</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">2</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Listos para Servir</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">1</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Mesa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Tiempo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{order.table}</td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{order.time}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{order.items} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--foreground)]">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" title="Ver detalles">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
