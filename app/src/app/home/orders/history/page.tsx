'use client';

import React, { useState, useEffect } from 'react';
import { Button } from 'app/ui/buttons';
import { getOrdenes, getOrdenItems } from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, usePopup } from 'app/ui/popUp';
import { Eye, Printer, FileText } from 'lucide-react';
import type { Orden, OrdenItem, EstadoOrden } from 'app/types/product';

// TODO: Obtener de contexto o usuario actual
const RESTAURANTE_ID = "";

export default function OrderHistoryPage() {
  const detailsPopup = usePopup();
  
  const [orders, setOrders] = useState<Orden[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
  const [orderItems, setOrderItems] = useState<OrdenItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtros
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<EstadoOrden | ''>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cargar órdenes completadas y canceladas
  async function fetchOrders() {
    setIsLoading(true);
    try {
      const filters: { restauranteId: string; estado?: EstadoOrden } = {
        restauranteId: RESTAURANTE_ID,
      };
      
      if (filterStatus) {
        filters.estado = filterStatus;
      }
      
      const response = await getOrdenes(filters);
      
      if (response.data) {
        // Filtrar solo completadas y canceladas si no hay filtro específico
        let ordersData = response.data.data || [];
        if (!filterStatus) {
          ordersData = ordersData.filter(
            (order: Orden) => order.estado === 'completada' || order.estado === 'cancelada'
          );
        }
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      toast.error("Error al cargar historial de órdenes");
    } finally {
      setIsLoading(false);
    }
  }

  // Cargar items de una orden
  async function fetchOrderDetails(order: Orden) {
    setSelectedOrder(order);
    try {
      const response = await getOrdenItems(order.id);
      if (response.data) {
        setOrderItems(response.data.data || []);
      }
      detailsPopup.open();
    } catch (error) {
      console.error('Error al obtener items:', error);
      toast.error("Error al cargar detalles de la orden");
    }
  }

  // Aplicar filtros
  function handleApplyFilters() {
    fetchOrders();
  }

  // Calcular estadísticas
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: Orden) => sum + order.total, 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const getStatusBadge = (estado: EstadoOrden) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      en_proceso: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    
    const labels = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[estado]}`}>
        {labels[estado]}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Historial de Pedidos</h2>
            <p className="text-[var(--muted-foreground)] mt-1">
              Consulta todos los pedidos completados y cancelados
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Desde</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Hasta</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Estado</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as EstadoOrden | '')}
              >
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleApplyFilters}
                className="w-full"
                disabled={isLoading}
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Total Pedidos</p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{totalOrders}</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Ingresos Totales</p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Promedio por Pedido</p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
              ${averageOrder.toFixed(2)}
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Orden</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          #{order.id.substring(0, 8)}
                        </div>
                        {order.notas && (
                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            {order.notas.substring(0, 30)}
                            {order.notas.length > 30 && '...'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        {new Date(order.fecha_orden).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[var(--foreground)]">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.estado)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => fetchOrderDetails(order)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {isLoading ? 'Cargando...' : 'No hay órdenes en el historial'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Detalles de la Orden */}
      <Popup
        isOpen={detailsPopup.isOpen}
        onClose={detailsPopup.close}
        title={`Detalles - Orden #${selectedOrder?.id.substring(0, 8)}`}
        description={`Fecha: ${selectedOrder ? new Date(selectedOrder.fecha_orden).toLocaleString() : ''}`}
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          {/* Información General */}
          <div className="border-b border-[var(--border)] pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">Estado:</span>
                <div className="mt-1">
                  {selectedOrder && getStatusBadge(selectedOrder.estado)}
                </div>
              </div>
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">Total:</span>
                <div className="text-lg font-bold text-[var(--foreground)] mt-1">
                  ${selectedOrder?.total.toFixed(2)}
                </div>
              </div>
            </div>
            {selectedOrder?.notas && (
              <div className="mt-4">
                <span className="text-sm text-[var(--muted-foreground)]">Notas:</span>
                <p className="text-sm text-[var(--foreground)] mt-1">
                  {selectedOrder.notas}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Items del Pedido</h4>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      Item #{item.id.substring(0, 8)}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                    </div>
                    {item.notas && (
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        Notas: {item.notas}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
              
              {orderItems.length === 0 && (
                <div className="text-center py-4 text-sm text-[var(--muted-foreground)]">
                  No hay items en esta orden
                </div>
              )}
            </div>
          </div>
        </div>
      </Popup>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
