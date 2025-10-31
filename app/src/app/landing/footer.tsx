import React from 'react';
import Image from 'next/image';
import { CustomLink } from 'app/ui/links';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/3.svg" alt="CrossFood" width={32} height={32} />
              <span className="text-xl font-bold text-[var(--foreground)]">CrossFood</span>
            </div>
            <p className="text-[var(--muted-foreground)] text-sm mb-6 max-w-sm">
              Sistema completo de gestión de pedidos con QR para restaurantes modernos.
            </p>
          </div>
          
          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-4 text-sm">Producto</h4>
            <ul className="space-y-3">
              <li><CustomLink href="#features" variant="footer" className="text-sm">Características</CustomLink></li>
              <li><CustomLink href="#" variant="footer" className="text-sm">Precios</CustomLink></li>
              <li><CustomLink href="#contact" variant="footer" className="text-sm">Contacto</CustomLink></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              <li><CustomLink href="#" variant="footer" className="text-sm">Privacidad</CustomLink></li>
              <li><CustomLink href="#" variant="footer" className="text-sm">Términos</CustomLink></li>
              <li><CustomLink href="#" variant="footer" className="text-sm">Cookies</CustomLink></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar - Minimalista */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--muted-foreground)] text-xs">
            © {currentYear} CrossFood. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a 
              href="#" 
              className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              aria-label="Twitter"
            >
              𝕏
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              aria-label="LinkedIn"
            >
              in
            </a>
            <a 
              href="#" 
              className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              aria-label="GitHub"
            >
              ◆
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
