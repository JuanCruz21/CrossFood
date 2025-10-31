'use client';

import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '📱',
    title: 'Pedidos QR',
    description: 'Escanea, pide y paga desde el móvil sin esperas.'
  },
  {
    icon: '⚡',
    title: 'Tiempo Real',
    description: 'Actualizaciones instantáneas de cocina a mesa.'
  },
  {
    icon: '💳',
    title: 'Pagos Seguros',
    description: 'Múltiples métodos de pago y facturación automática.'
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Dashboard con métricas y reportes detallados.'
  },
  {
    icon: '🔔',
    title: 'Notificaciones',
    description: 'Alertas automáticas para personal y clientes.'
  },
  {
    icon: '🎯',
    title: 'Gestión Inteligente',
    description: 'Control total de mesas, turnos y zonas.'
  }
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`group transition-all duration-700 delay-${index * 100} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg bg-[var(--card)]">
        <div className="text-4xl mb-4">{feature.icon}</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          {feature.title}
        </h3>
        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export const Features: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  
  return (
    <section id="features" className="py-32 bg-[var(--background)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`max-w-2xl mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            Todo en una plataforma
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            Las herramientas que necesitas para transformar la experiencia de tu restaurante.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
