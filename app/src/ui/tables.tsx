/**
 * DataTable Component
 * Reusable, fully responsive table with filtering, pagination, sorting, and actions
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from './buttons';

// ============================================
// Types
// ============================================

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  hidden?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  show?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: TableAction<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    return (acc as Record<string, unknown>)?.[part];
  }, obj);
}

// ============================================
// Component
// ============================================

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchKeys,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter visible columns
  const visibleColumns = useMemo(
    () => columns.filter(col => !col.hidden),
    [columns]
  );

  // Search functionality
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const keysToSearch = searchKeys || visibleColumns.map(col => col.key);

    return data.filter(item => {
      return keysToSearch.some(key => {
        const value = getNestedValue(item, key);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchKeys, visibleColumns]);

  // Sort functionality
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      if (aValue === bValue) return 0;

      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Type-safe comparison
      const comparison = String(aValue) < String(bValue) ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Reset to page 1 when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortOrder]);

  // ============================================
  // Render
  // ============================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-[var(--input)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Limpiar
            </Button>
          )}
        </div>
      )}

      {/* Table Container - Responsive */}
      <div className="overflow-x-auto bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--muted-foreground)]">
            <svg
              className="w-12 h-12 mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)] ${
                      column.sortable ? 'cursor-pointer hover:bg-[var(--muted)]/80 select-none' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <span className="text-[var(--muted-foreground)]">
                          {sortKey === column.key ? (
                            sortOrder === 'asc' ? '↑' : '↓'
                          ) : (
                            '↕'
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--foreground)]">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {column.render
                        ? column.render(item)
                        : String(getNestedValue(item, column.key) ?? '-')}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, actionIndex) => {
                          const shouldShow = action.show ? action.show(item) : true;
                          if (!shouldShow) return null;

                          return (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={() => action.onClick(item)}
                              className="whitespace-nowrap"
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}{' '}
            resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              ««
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </Button>
            <span className="text-sm text-[var(--foreground)] px-3">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »»
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
