'use client';

import React from 'react';
import type { OrdenItemConProducto, ProductoConModificadores, ModificadorSeleccionado } from '@/types/product';
import { Button } from 'app/ui/buttons';

interface OrdenBorradorProps {
  items: OrdenItemConProducto[];
  numeroMesa: number;
  numeroComensales: number;
  onUpdateCantidad: (itemId: string, cantidad: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEnviarComanda: () => void;
  onClose: () => void;
  onAddMoreProducts: () => void;
  esEdicion?: boolean;
}

export function OrdenBorrador({
  items,
  numeroMesa,
  numeroComensales,
  onUpdateCantidad,
  onRemoveItem,
  onEnviarComanda,
  onClose,
  onAddMoreProducts,
  esEdicion = false,
}: OrdenBorradorProps) {
  const calcularSubtotal = (item: OrdenItemConProducto) => {
    return item.precio_unitario * item.cantidad;
  };

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + calcularSubtotal(item), 0);
  };

  const agruparPorDestino = () => {
    const cocina = items.filter(item => item.destino === 'cocina');
    const bar = items.filter(item => item.destino === 'bar');
    return { cocina, bar };
  };

  const { cocina, bar } = agruparPorDestino();
  
  // Contar items nuevos vs existentes
  const itemsNuevos = items.filter(item => item.id.startsWith('temp-'));
  const itemsExistentes = items.filter(item => !item.id.startsWith('temp-'));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                {esEdicion ? 'Editar Orden' : 'Orden en Borrador'}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Mesa {numeroMesa}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{numeroComensales} comensales</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--muted)]/30 rounded-lg p-3 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Total Items</p>
              <p className="text-xl font-bold text-[var(--foreground)]">{items.length}</p>
            </div>
            {cocina.length > 0 && (
              <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-orange-600 dark:text-orange-400">Cocina</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{cocina.length}</p>
              </div>
            )}
            {bar.length > 0 && (
              <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400">Bar</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{bar.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg mb-4">No hay productos en la orden</p>
              <Button onClick={onAddMoreProducts} variant="primary">
                Agregar Productos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[var(--foreground)]">
                            {item.producto?.nombre || 'Producto'}
                          </h3>
                          {item.destino && (
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                                item.destino === 'cocina'
                                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {item.destino === 'cocina' ? '🍳 Cocina' : '🍹 Bar'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded text-red-600 dark:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Modificadores */}
                      {item.modificadores && item.modificadores.length > 0 && (
                        <div className="text-xs text-[var(--muted-foreground)] mb-2 space-y-1">
                          {item.modificadores.map((mod, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span>• {mod.nombre_modificador}: {mod.nombre_opcion}</span>
                              {mod.precio_adicional > 0 && (
                                <span className="text-[var(--primary)]">+${mod.precio_adicional.toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notas */}
                      {item.notas && (
                        <p className="text-sm text-[var(--muted-foreground)] italic">
                          Nota: {item.notas}
                        </p>
                      )}

                      {/* Cantidad y Precio */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateCantidad(item.id, Math.max(1, item.cantidad - 1))}
                            className="w-8 h-8 rounded-lg bg-[var(--muted)] hover:bg-[var(--muted)]/70 transition-colors flex items-center justify-center"
                            disabled={item.cantidad <= 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-lg font-bold text-[var(--foreground)] w-8 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => onUpdateCantidad(item.id, item.cantidad + 1)}
                            className="w-8 h-8 rounded-lg bg-[var(--muted)] hover:bg-[var(--muted)]/70 transition-colors flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            ${item.precio_unitario.toFixed(2)} c/u
                          </p>
                          <p className="text-lg font-bold text-[var(--primary)]">
                            ${calcularSubtotal(item).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[var(--border)] bg-[var(--muted)]/30 space-y-4">
            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>Subtotal</span>
              <span>${calcularTotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--foreground)]">Total</span>
              <span className="text-3xl font-bold text-[var(--primary)]">
                ${calcularTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <Button onClick={onAddMoreProducts} variant="ghost" className="flex-1">
                + Agregar Más
              </Button>
              <Button onClick={onEnviarComanda} variant="primary" className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {esEdicion 
                  ? itemsNuevos.length > 0 
                    ? 'Actualizar Orden' 
                    : 'Guardar Cambios'
                  : `Enviar a ${cocina.length > 0 && bar.length > 0 ? 'Cocina y Bar' : cocina.length > 0 ? 'Cocina' : 'Bar'}`
                }
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
