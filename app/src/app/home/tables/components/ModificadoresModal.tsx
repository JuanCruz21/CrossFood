'use client';

import React, { useState } from 'react';
import type { ProductoConModificadores, ModificadorSeleccionado, Modificador } from '@/types/product';
import { Button } from 'app/ui/buttons';

interface ModificadoresModalProps {
  producto: ProductoConModificadores;
  cantidad: number;
  onCantidadChange: (cantidad: number) => void;
  onConfirm: (modificadores: ModificadorSeleccionado[]) => void;
  onClose: () => void;
}

export function ModificadoresModal({
  producto,
  cantidad,
  onCantidadChange,
  onConfirm,
  onClose,
}: ModificadoresModalProps) {
  const [modificadoresSeleccionados, setModificadoresSeleccionados] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const handleOpcionChange = (modificadorId: string, opcionId: string) => {
    const newSeleccion = new Map(modificadoresSeleccionados);
    newSeleccion.set(modificadorId, opcionId);
    setModificadoresSeleccionados(newSeleccion);
    setError(null);
  };

  const calcularPrecioTotal = () => {
    let precioBase = producto.precio;
    
    modificadoresSeleccionados.forEach((opcionId, modificadorId) => {
      const modificador = producto.modificadores?.find(m => m.id === modificadorId);
      const opcion = modificador?.opciones.find(o => o.id === opcionId);
      if (opcion?.precio_adicional) {
        precioBase += opcion.precio_adicional;
      }
    });

    return precioBase * cantidad;
  };

  const handleConfirm = () => {
    // Validar que todos los modificadores obligatorios estén seleccionados
    const modificadoresObligatorios = producto.modificadores?.filter(m => m.tipo === 'obligatorio') || [];
    const faltantes = modificadoresObligatorios.filter(m => !modificadoresSeleccionados.has(m.id));

    if (faltantes.length > 0) {
      setError(`Por favor selecciona: ${faltantes.map(m => m.nombre).join(', ')}`);
      return;
    }

    // Construir array de modificadores seleccionados
    const modificadores: ModificadorSeleccionado[] = [];
    modificadoresSeleccionados.forEach((opcionId, modificadorId) => {
      const modificador = producto.modificadores?.find(m => m.id === modificadorId);
      const opcion = modificador?.opciones.find(o => o.id === opcionId);
      
      if (modificador && opcion) {
        modificadores.push({
          modificador_id: modificadorId,
          opcion_id: opcionId,
          nombre_modificador: modificador.nombre,
          nombre_opcion: opcion.nombre,
          precio_adicional: opcion.precio_adicional || 0,
        });
      }
    });

    onConfirm(modificadores);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Personalizar Producto
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">{producto.nombre}</p>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cantidad */}
          <div className="bg-[var(--muted)]/30 rounded-xl p-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Cantidad
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onCantidadChange(Math.max(1, cantidad - 1))}
                className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center justify-center"
                disabled={cantidad <= 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-2xl font-bold text-[var(--foreground)] w-12 text-center">
                {cantidad}
              </span>
              <button
                onClick={() => onCantidadChange(cantidad + 1)}
                className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modificadores */}
          {producto.modificadores?.map((modificador) => (
            <div key={modificador.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  {modificador.nombre}
                </label>
                {modificador.tipo === 'obligatorio' ? (
                  <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                    Obligatorio
                  </span>
                ) : (
                  <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    Opcional
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {modificador.opciones.map((opcion) => {
                  const isSelected = modificadoresSeleccionados.get(modificador.id) === opcion.id;
                  return (
                    <button
                      key={opcion.id}
                      onClick={() => handleOpcionChange(modificador.id, opcion.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-[var(--primary)] bg-[var(--primary)]'
                                : 'border-[var(--border)]'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-[var(--foreground)]">{opcion.nombre}</span>
                        </div>
                        {opcion.precio_adicional && opcion.precio_adicional > 0 && (
                          <span className="text-sm font-semibold text-[var(--primary)]">
                            +${opcion.precio_adicional.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--muted-foreground)]">Total</span>
            <span className="text-3xl font-bold text-[var(--primary)]">
              ${calcularPrecioTotal().toFixed(2)}
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} variant="primary" className="flex-1">
              Agregar al Pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
