'use client';

import React from 'react';

export default function OrderHistoryPage() {
  const historyOrders = [
    { id: 101, table: 'Mesa 5', date: '30/10/2025', time: '14:30', items: 3, total: 45.50, payment: 'Efectivo' },
    { id: 100, table: 'Mesa 12', date: '30/10/2025', time: '13:45', items: 2, total: 32.00, payment: 'Tarjeta' },
    { id: 99, table: 'Mesa 8', date: '30/10/2025', time: '13:20', items: 5, total: 67.80, payment: 'Tarjeta' },
    { id: 98, table: 'Mesa 3', date: '30/10/2025', time: '12:50', items: 4, total: 52.20, payment: 'Efectivo' },
    { id: 97, table: 'Mesa 15', date: '29/10/2025', time: '19:30', items: 2, total: 28.50, payment: 'Transferencia' },
    { id: 96, table: 'Mesa 7', date: '29/10/2025', time: '18:45', items: 6, total: 89.00, payment: 'Tarjeta' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Historial de Pedidos</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Consulta todos los pedidos completados
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors font-medium">
            Filtros
          </button>
          <button className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors font-medium">
            Exportar
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Desde</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              defaultValue="2025-10-01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Hasta</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              defaultValue="2025-10-31"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Pedidos</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{historyOrders.length}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Ingresos Totales</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
            ${historyOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Promedio por Pedido</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
            ${(historyOrders.reduce((sum, order) => sum + order.total, 0) / historyOrders.length).toFixed(2)}
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Mesa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Hora</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Pago</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {historyOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{order.table}</td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{order.time}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{order.items} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--foreground)]">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{order.payment}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" title="Ver detalles">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" title="Imprimir">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          Mostrando 1-6 de 6 pedidos
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-sm font-medium" disabled>
            Anterior
          </button>
          <button className="px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-sm font-medium" disabled>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
