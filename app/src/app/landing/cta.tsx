'use client';

import React from 'react';
import { Button } from 'app/ui/buttons';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const CTA: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section 
      id="contact" 
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 bg-[var(--card)] border-y border-[var(--border)]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Main Content */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
              Comienza hoy mismo
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Únete a más de 100 restaurantes que ya transformaron su servicio.
            </p>
          </div>
          
          {/* Benefits - Minimalista */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full"></span>
              Setup en 24h
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full"></span>
              Soporte incluido
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full"></span>
              Sin compromiso
            </div>
          </div>
          
          {/* CTA Form - Limpio */}
          <div className="max-w-xl mx-auto">
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="tu@email.com"
                className="flex-1 px-5 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                required
              />
              <Button 
                type="submit"
                variant="primary" 
                size="md"
                className="whitespace-nowrap"
              >
                Solicitar Demo
              </Button>
            </form>
            
            <p className="text-xs text-[var(--muted-foreground)] mt-4 text-center">
              Te contactaremos en menos de 24 horas
            </p>
          </div>
          
          {/* Contact Info - Minimalista */}
          <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-center gap-8 text-sm text-[var(--muted-foreground)]">
            <a href="mailto:info@crossfood.com" className="flex items-center justify-center gap-2 hover:text-[var(--primary)] transition-colors">
              <span>✉</span>
              <span>info@crossfood.com</span>
            </a>
            <a href="tel:+34900123456" className="flex items-center justify-center gap-2 hover:text-[var(--primary)] transition-colors">
              <span>☎</span>
              <span>+34 900 123 456</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
