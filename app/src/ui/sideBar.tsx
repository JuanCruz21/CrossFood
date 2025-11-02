'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeToggle, useTheme } from '../app/hooks/useTheme';
import { toast } from 'react-toastify';
import { clearAuthToken } from 'app/lib/api';
import { MenuItem, sidebarConfig } from './sidebarConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuItemComponent: React.FC<{ item: MenuItem; depth?: number }> = ({ item, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const isActive = item.href ? pathname === item.href : false;

  if (item.children && item.children.length > 0) {
    // Acordeón con submenú
    return (
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            depth === 0 ? 'hover:bg-[var(--muted)]' : 'hover:bg-[var(--muted)]/50'
          } text-[var(--foreground)]`}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-[var(--muted-foreground)]">{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <MenuItemComponent key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Link directo
  return (
    <Link
      href={item.href || '#'}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
      }`}
      style={{ paddingLeft: `${depth * 16 + 16}px` }}
    >
      <span className={isActive ? '' : 'text-[var(--muted-foreground)]'}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    // Limpiar cookie que guardamos en el login
    try {
      // Borrar cookie access_token
      document.cookie = 'access_token=; path=/; max-age=0;';
    } catch (e) {
      // nada
    }

    // Limpiar token almacenado en local/session storage (si aplica)
    try {
      clearAuthToken();
    } catch (e) {
      // noop
    }

    // Mostrar mensaje y redirigir al login
    toast.success('Sesión cerrada');
    onClose();
    router.replace('/auth/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Aquí irá la lógica de búsqueda
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src={theme === 'dark' ? '/3.svg' : '/4.svg'}
                alt="CrossFood Logo"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-[var(--foreground)]">CrossFood</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarConfig.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Tema</span>
            <ThemeToggle />
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--muted)]">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">John Doe</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">admin@crossfood.com</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};
