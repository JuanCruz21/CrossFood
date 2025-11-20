'use client';

import React, { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Categoria, ProductoConModificadores, ModificadorSeleccionado } from '@/types/product';
import { Button } from 'app/ui/buttons';
import { ModificadoresModal } from '../components/ModificadoresModal';

interface MenuSelectorProps {
  restauranteId: string;
  onAddProduct: (producto: ProductoConModificadores, cantidad: number, modificadores?: ModificadorSeleccionado[]) => void;
  onClose: () => void;
}

export function MenuSelector({ restauranteId, onAddProduct, onClose }: MenuSelectorProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<ProductoConModificadores[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConModificadores | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModificadores, setShowModificadores] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, [restauranteId]);

  useEffect(() => {
    if (categoriaSeleccionada) {
      loadProductos(categoriaSeleccionada);
    }
  }, [categoriaSeleccionada]);

  const loadCategorias = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/categorias/?restaurante_id=${restauranteId}`);
      const categoriasData = response.data?.data || [];
      setCategorias(categoriasData);
      if (categoriasData.length > 0) {
        setCategoriaSeleccionada(categoriasData[0].id);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductos = async (categoriaId: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/productos/?categoria_id=${categoriaId}`);
      const productosData = response.data?.data || [];
      // Aquí deberíamos cargar los modificadores de cada producto
      // Por ahora, agregamos un array vacío
      const productosConModificadores = productosData.map((p: ProductoConModificadores) => ({
        ...p,
        modificadores: [], // TODO: Cargar desde la API
      }));
      setProductos(productosConModificadores);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (producto: ProductoConModificadores) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
    
    // Si tiene modificadores, mostrar modal
    if (producto.modificadores && producto.modificadores.length > 0) {
      setShowModificadores(true);
    } else {
      // Agregar directamente
      onAddProduct(producto, 1);
    }
  };

  const handleConfirmModificadores = (modificadores: ModificadorSeleccionado[]) => {
    if (productoSeleccionado) {
      onAddProduct(productoSeleccionado, cantidad, modificadores);
      setShowModificadores(false);
      setProductoSeleccionado(null);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Seleccionar Productos</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
            <svg
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categorías Sidebar */}
          <div className="w-64 border-r border-[var(--border)] overflow-y-auto">
            <div className="p-4 space-y-2">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  onClick={() => setCategoriaSeleccionada(categoria.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    categoriaSeleccionada === categoria.id
                      ? 'bg-[var(--primary)] text-white shadow-lg'
                      : 'hover:bg-[var(--muted)] text-[var(--foreground)]'
                  }`}
                >
                  <div className="font-medium">{categoria.nombre}</div>
                  {categoria.descripcion && (
                    <div className="text-xs opacity-75 mt-1">{categoria.descripcion}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Productos Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No hay productos en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => handleProductClick(producto)}
                    className="group bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-xl hover:border-[var(--primary)] transition-all duration-300 text-left"
                  >
                    {producto.imagen && (
                      <div className="aspect-video overflow-hidden bg-[var(--muted)]">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                        {producto.nombre}
                      </h3>
                      {producto.descripcion && (
                        <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[var(--primary)]">
                          ${producto.precio.toFixed(2)}
                        </span>
                        {producto.modificadores && producto.modificadores.length > 0 && (
                          <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                            Personalizable
                          </span>
                        )}
                      </div>
                      {producto.stock !== undefined && producto.stock <= 5 && (
                        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                          Stock bajo: {producto.stock} disponibles
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Modificadores */}
      {showModificadores && productoSeleccionado && (
        <ModificadoresModal
          producto={productoSeleccionado}
          cantidad={cantidad}
          onCantidadChange={setCantidad}
          onConfirm={handleConfirmModificadores}
          onClose={() => {
            setShowModificadores(false);
            setProductoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}
