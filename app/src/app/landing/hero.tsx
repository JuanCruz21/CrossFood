'use client';

import React from 'react';
import { Button } from 'app/ui/buttons';

export const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Minimal Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Subtle Gradient Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[var(--accent)] rounded-full opacity-10 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge Minimal */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full"></span>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Sistema QR para Restaurantes</span>
          </div>
          
          {/* Main Heading - Minimalista */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="text-[var(--foreground)]">Gestión de</span>
            <br />
            <span className="text-[var(--primary)]">Pedidos QR</span>
          </h1>
          
          {/* Subheading - Más limpio */}
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl">
            Moderniza tu restaurante con nuestro sistema completo. 
            Del escaneo a la facturación en segundos.
          </p>
          
          {/* CTA Buttons - Minimalistas */}
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <Button 
              size="lg" 
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => scrollToSection('features')}
            >
              Ver Características →
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => scrollToSection('contact')}
            >
              Solicitar Demo
            </Button>
          </div>
          
          {/* Stats - Diseño limpio */}
          <div className="flex flex-wrap gap-8 mt-20 pt-8 border-t border-[var(--border)]">
            <div>
              <div className="text-3xl font-bold text-[var(--foreground)]">100+</div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">Restaurantes activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--foreground)]">50K+</div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">Pedidos mensuales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--foreground)]">98%</div>
              <div className="text-sm text-[var(--muted-foreground)] mt-1">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator - Minimalista */}
      <button
        onClick={() => scrollToSection('features')}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors animate-bounce"
        aria-label="Scroll to features"
      >
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </button>
    </section>
  );
};
