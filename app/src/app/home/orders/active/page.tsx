'use client';

import React, { useState, useEffect } from 'react';
import { getOrdenesActivas } from '@/lib/api';
import { Orden, OrdenItemDetallado } from '@/types/product';

export default function ActiveOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Obtener restaurante_id del contexto/sesión del usuario
  const restauranteId = '123e4567-e89b-12d3-a456-426614174000'; // Placeholder

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrdenesActivas(restauranteId);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setOrders(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar las órdenes');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Orden) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'en_proceso':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'completada':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'cancelada':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Nuevo';
      case 'en_proceso':
        return 'Preparando';
      case 'completada':
        return 'Listo';
      case 'cancelada':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const calculateTimeElapsed = (fecha: string) => {
    const orderDate = new Date(fecha);
    const now = new Date();
    const diff = Math.floor((now.getTime() - orderDate.getTime()) / 1000 / 60); // minutos
    return `${diff} min`;
  };

  const statsData = {
    pendiente: orders.filter(o => o.estado === 'pendiente').length,
    en_proceso: orders.filter(o => o.estado === 'en_proceso').length,
    completada: orders.filter(o => o.estado === 'completada').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--muted-foreground)]">Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={loadOrders}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    );
  }

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
        <button 
          onClick={loadOrders}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Pedidos Nuevos</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{statsData.pendiente}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">En Preparación</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{statsData.en_proceso}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Listos para Servir</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{statsData.completada}</p>
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
                  <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                    {order.mesa_numero ? `Mesa ${order.mesa_numero}` : 'Sin mesa'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{calculateTimeElapsed(order.fecha)}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{order.total_items || 0} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--foreground)]">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                      {getStatusLabel(order.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" 
                        title="Ver detalles"
                      >
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

      {/* Modal de Detalles */}
      {isModalOpen && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  Detalles del Pedido #{selectedOrder.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {selectedOrder.mesa_numero ? `Mesa ${selectedOrder.mesa_numero}` : 'Sin mesa'} • {new Date(selectedOrder.fecha).toLocaleString('es-ES')}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                title="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Info General */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[var(--muted)]/50 rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Estado</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.estado)}`}>
                    {getStatusLabel(selectedOrder.estado)}
                  </span>
                </div>
                <div className="bg-[var(--muted)]/50 rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Tiempo</p>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{calculateTimeElapsed(selectedOrder.fecha)}</p>
                </div>
                <div className="bg-[var(--muted)]/50 rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Comensales</p>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{selectedOrder.numero_comensales || 'N/A'}</p>
                </div>
                <div className="bg-[var(--muted)]/50 rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Total</p>
                  <p className="text-sm font-bold text-[var(--foreground)]">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-[var(--border)]" />

              {/* Items del Pedido */}
              <div>
                <h4 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Items del Pedido ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: OrdenItemDetallado) => (
                      <div 
                        key={item.id}
                        className="bg-[var(--muted)]/30 rounded-lg p-4 hover:bg-[var(--muted)]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-[var(--foreground)]">{item.producto_nombre || 'Producto'}</h5>
                              <span className="text-sm text-[var(--muted-foreground)]">
                                × {item.cantidad}
                              </span>
                            </div>
                            {item.notas && (
                              <p className="text-sm text-[var(--muted-foreground)] mt-1 italic">
                                📝 {item.notas}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[var(--muted-foreground)]">
                              ${item.precio_unitario.toFixed(2)} c/u
                            </p>
                            <p className="font-semibold text-[var(--foreground)] mt-1">
                              ${(item.precio_unitario * item.cantidad).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--muted-foreground)] text-center py-4">No hay items en este pedido</p>
                  )}
                </div>
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-[var(--border)]" />

              {/* Resumen de Totales */}
              <div className="bg-[var(--muted)]/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                  <span className="text-[var(--foreground)] font-medium">${selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Propina (Opcional)</span>
                  <span className="text-[var(--foreground)] font-medium">$0.00</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--foreground)]">Total Final</span>
                    <span className="font-bold text-lg text-[var(--foreground)]">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Cambiar Estado
                </button>
                <button className="flex-1 px-4 py-3 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 transition-colors font-medium">
                  Imprimir Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
