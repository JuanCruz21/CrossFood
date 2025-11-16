"use client";
import React, { useState, useEffect } from 'react';
import { Button } from 'app/ui/buttons';
import { Input, TextArea } from 'app/ui/input';
import { 
    getOrdenes, 
    createOrden, 
    updateOrdenEstado,
    getOrdenItems,
    createOrdenItem,
    deleteOrdenItem,
    getProductos
} from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Plus, Clock, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import type { 
    Orden, 
    OrdenCreate, 
    OrdenItem,
    OrdenItemCreate,
    Producto,
    EstadoOrden 
} from 'app/types/product';

// TODO: Obtener de contexto o usuario actual
const RESTAURANTE_ID = "";

export default function PendingOrders() {
    const newOrderPopup = usePopup();
    const addItemPopup = usePopup();
    const changeStatusPopup = usePopup();
    
    const [orders, setOrders] = useState<Orden[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
    const [orderItems, setOrderItems] = useState<OrdenItem[]>([]);
    const [products, setProducts] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState<EstadoOrden>('en_proceso');
    
    const [orderFormData, setOrderFormData] = useState<OrdenCreate>({
        estado: 'pendiente',
        total: 0,
        notas: '',
        restaurante_id: RESTAURANTE_ID,
        cliente_id: undefined,
        mesa_id: undefined,
    });
    
    const [itemFormData, setItemFormData] = useState<OrdenItemCreate>({
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0,
        notas: '',
        orden_id: '',
        producto_id: '',
    });

    useEffect(() => {
        fetchPendingOrders();
        fetchProducts();
    }, []);

    // Cargar órdenes pendientes y en proceso
    async function fetchPendingOrders() {
        try {
            const [pendingResponse, processingResponse] = await Promise.all([
                getOrdenes({ restauranteId: RESTAURANTE_ID, estado: 'pendiente' }),
                getOrdenes({ restauranteId: RESTAURANTE_ID, estado: 'en_proceso' }),
            ]);
            
            const allOrders = [
                ...(pendingResponse.data?.data || []),
                ...(processingResponse.data?.data || []),
            ];
            
            setOrders(allOrders);
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            toast.error("Error al cargar órdenes");
        }
    }

    // Cargar productos
    async function fetchProducts() {
        try {
            const response = await getProductos({ restauranteId: RESTAURANTE_ID });
            if (response.data) {
                setProducts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener productos:', error);
            toast.error("Error al cargar productos");
        }
    }

    // Cargar items de una orden
    async function fetchOrderItems(ordenId: string) {
        try {
            const response = await getOrdenItems(ordenId);
            if (response.data) {
                setOrderItems(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener items:', error);
            toast.error("Error al cargar items de la orden");
        }
    }

    // Crear nueva orden
    async function handleCreateOrder() {
        setIsLoading(true);
        try {
            await createOrden(orderFormData);
            toast.success("Orden creada correctamente");
            await fetchPendingOrders();
            newOrderPopup.close();
            resetOrderForm();
        } catch (error) {
            console.error('Error al crear orden:', error);
            toast.error("Error al crear orden");
        } finally {
            setIsLoading(false);
        }
    }

    // Agregar item a la orden
    async function handleAddItem() {
        setIsLoading(true);
        try {
            const selectedProduct = products.find(p => p.id === itemFormData.producto_id);
            if (!selectedProduct) {
                toast.error("Producto no encontrado");
                return;
            }

            const itemData: OrdenItemCreate = {
                ...itemFormData,
                precio_unitario: selectedProduct.precio,
                subtotal: selectedProduct.precio * itemFormData.cantidad,
            };

            await createOrdenItem(itemData);
            toast.success("Item agregado correctamente");
            
            if (selectedOrder) {
                await fetchOrderItems(selectedOrder.id);
            }
            
            await fetchPendingOrders();
            addItemPopup.close();
            resetItemForm();
        } catch (error) {
            console.error('Error al agregar item:', error);
            toast.error("Error al agregar item");
        } finally {
            setIsLoading(false);
        }
    }

    // Cambiar estado de orden
    async function handleChangeStatus() {
        if (!selectedOrder) return;
        
        setIsLoading(true);
        try {
            await updateOrdenEstado(selectedOrder.id, newStatus);
            toast.success("Estado actualizado correctamente");
            await fetchPendingOrders();
            changeStatusPopup.close();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.error("Error al actualizar estado");
        } finally {
            setIsLoading(false);
        }
    }

    // Eliminar item de orden
    async function handleDeleteItem(itemId: string) {
        if (!window.confirm('¿Eliminar este item?')) return;
        
        try {
            await deleteOrdenItem(itemId);
            toast.success("Item eliminado");
            
            if (selectedOrder) {
                await fetchOrderItems(selectedOrder.id);
            }
            
            await fetchPendingOrders();
        } catch (error) {
            console.error('Error al eliminar item:', error);
            toast.error("Error al eliminar item");
        }
    }

    // Abrir modal para agregar items
    function openAddItemModal(order: Orden) {
        setSelectedOrder(order);
        setItemFormData({
            ...itemFormData,
            orden_id: order.id,
        });
        fetchOrderItems(order.id);
        addItemPopup.open();
    }

    // Abrir modal de cambio de estado
    function openChangeStatusModal(order: Orden) {
        setSelectedOrder(order);
        setNewStatus(order.estado === 'pendiente' ? 'en_proceso' : 'completada');
        changeStatusPopup.open();
    }

    function resetOrderForm() {
        setOrderFormData({
            estado: 'pendiente',
            total: 0,
            notas: '',
            restaurante_id: RESTAURANTE_ID,
            cliente_id: undefined,
            mesa_id: undefined,
        });
    }

    function resetItemForm() {
        setItemFormData({
            cantidad: 1,
            precio_unitario: 0,
            subtotal: 0,
            notas: '',
            orden_id: selectedOrder?.id || '',
            producto_id: '',
        });
    }

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
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">Pedidos Activos</h2>
                        <p className="text-[var(--muted-foreground)] mt-1">
                            Gestiona los pedidos en proceso
                        </p>
                    </div>
                    <Button
                        onClick={newOrderPopup.open}
                        variant="primary"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Pedido
                    </Button>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div 
                            key={order.id}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-[var(--primary)]" />
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">
                                        Orden #{order.id.substring(0, 8)}
                                    </span>
                                </div>
                                {getStatusBadge(order.estado)}
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--muted-foreground)]">Total:</span>
                                    <span className="text-lg font-bold text-[var(--foreground)]">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>
                                
                                {order.notas && (
                                    <div>
                                        <span className="text-sm text-[var(--muted-foreground)]">Notas:</span>
                                        <p className="text-sm text-[var(--foreground)] mt-1">
                                            {order.notas}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                                    <Clock className="h-3 w-3" />
                                    {new Date(order.fecha_orden).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => openAddItemModal(order)}
                                    className="flex-1"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Items
                                </Button>
                                <Button
                                    variant={order.estado === 'pendiente' ? 'primary' : 'secondary'}
                                    onClick={() => openChangeStatusModal(order)}
                                    className="flex-1"
                                >
                                    {order.estado === 'pendiente' ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-1" /> Procesar
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" /> Completar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <ShoppingCart className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                            <p className="text-[var(--muted-foreground)]">No hay pedidos activos</p>
                            <Button
                                variant="outline"
                                onClick={newOrderPopup.open}
                                className="mt-4"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Crear primer pedido
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Nueva Orden */}
            <Popup
                isOpen={newOrderPopup.isOpen}
                onClose={() => { newOrderPopup.close(); resetOrderForm(); }}
                title="Nuevo Pedido"
                description="Crea un nuevo pedido"
                onConfirm={handleCreateOrder}
                confirmText="Crear Pedido"
                isLoading={isLoading}
                size="lg"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }}>
                    <TextArea
                        id="orderNotes"
                        label="Notas del Pedido"
                        placeholder="Notas adicionales (opcional)"
                        value={orderFormData.notas}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                            setOrderFormData({ ...orderFormData, notas: e.target.value })
                        }
                    />
                    
                    <div className="text-sm text-[var(--muted-foreground)]">
                        El pedido se creará en estado <strong>Pendiente</strong>. 
                        Después podrás agregar items y cambiar su estado.
                    </div>
                </form>
            </Popup>

            {/* Modal: Agregar Items */}
            <Popup
                isOpen={addItemPopup.isOpen}
                onClose={() => { addItemPopup.close(); resetItemForm(); }}
                title={`Items - Orden #${selectedOrder?.id.substring(0, 8)}`}
                description="Gestiona los items de esta orden"
                showFooter={false}
                size="xl"
            >
                <div className="space-y-4">
                    {/* Lista de items actuales */}
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                            Items Actuales
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {orderItems.map((item) => {
                                const product = products.find(p => p.id === item.producto_id);
                                return (
                                    <div 
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-[var(--foreground)]">
                                                {product?.nombre || 'Producto desconocido'}
                                            </div>
                                            <div className="text-xs text-[var(--muted-foreground)]">
                                                {item.cantidad} x ${item.precio_unitario.toFixed(2)} = ${item.subtotal.toFixed(2)}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                            
                            {orderItems.length === 0 && (
                                <div className="text-center py-4 text-sm text-[var(--muted-foreground)]">
                                    No hay items en esta orden
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulario para agregar nuevo item */}
                    <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                            Agregar Nuevo Item
                        </h4>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--foreground)]">
                                    Producto *
                                </label>
                                <select
                                    value={itemFormData.producto_id}
                                    onChange={(e) => setItemFormData({ ...itemFormData, producto_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    required
                                >
                                    <option value="">Selecciona un producto</option>
                                    {products.filter(p => p.stock > 0).map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.nombre} - ${product.precio.toFixed(2)} (Stock: {product.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                id="itemQuantity"
                                label="Cantidad"
                                type="number"
                                min="1"
                                value={itemFormData.cantidad.toString()}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                    setItemFormData({ ...itemFormData, cantidad: parseInt(e.target.value) || 1 })
                                }
                                required
                            />

                            <Button
                                variant="primary"
                                onClick={handleAddItem}
                                disabled={!itemFormData.producto_id || isLoading}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Agregar Item
                            </Button>
                        </div>
                    </div>
                </div>
            </Popup>

            {/* Modal: Cambiar Estado */}
            <AlertPopup
                isOpen={changeStatusPopup.isOpen}
                onClose={changeStatusPopup.close}
                onConfirm={handleChangeStatus}
                title="Cambiar Estado de Orden"
                message={`¿Cambiar el estado de la orden a "${newStatus === 'en_proceso' ? 'En Proceso' : 'Completada'}"?`}
                confirmText="Confirmar"
                cancelText="Cancelar"
                type="info"
            />

            <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
}