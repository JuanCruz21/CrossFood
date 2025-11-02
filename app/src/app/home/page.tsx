"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from 'app/lib/api';

export default function HomePage() {
  const router = useRouter();

  // Helper: leer cookie por nombre
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    const validateAndRedirect = async () => {
      // Priorizar cookie (la que guardamos en el login)
      const token = getCookie('access_token');

      if (!token) {
        // No hay token -> forzar login
        router.replace('/auth/login');
        return;
      }

      try {
        // Validar token llamando al endpoint protegido /users/me
        await apiRequest('/users/me', {
          method: 'GET',
          useAuth: false,
          // Enviamos el token manualmente en la cabecera Authorization
          headers: { Authorization: `Bearer ${token}` },
        });

        // Token válido -> redirigir al dashboard
        router.replace('/home/dashboard');
      } catch (err) {
        // Token inválido o error -> limpiar cookie y enviar al login
        document.cookie = 'access_token=; path=/; max-age=0;';
        router.replace('/auth/login');
      }
    };

    validateAndRedirect();
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Redirigiendo al Dashboard... 👋
        </h2>
        <p className="text-[var(--muted-foreground)]">
          Cargando tu panel de control...
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Pedidos Activos</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">24</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Ventas Hoy</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">$1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">12/20</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Clientes Hoy</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">87</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-[var(--foreground)]">Nuevo Pedido</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-[var(--foreground)]">Nueva Factura</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium text-[var(--foreground)]">Agregar Producto</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-[var(--foreground)]">Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Pedidos Recientes</h3>
          <button className="text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
            Ver todos
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[var(--primary)]">#{i}</span>
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Mesa {i}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Hace {i * 5} minutos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--foreground)]">${(25 + i * 10).toFixed(2)}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                  En proceso
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
