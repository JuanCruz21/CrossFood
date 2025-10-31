'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomLink } from 'app/ui/links';
import { ThemeToggle, useTheme } from '../hooks/useTheme';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme } = useTheme();
  
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[var(--card)]/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <CustomLink href="/" variant="nav" className="flex items-center gap-2">
              <Image 
                src={theme === 'dark' ? "/3.svg" : "/4.svg"} 
                alt="CrossFood Logo" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-[var(--foreground)]">CrossFood</span>
            </CustomLink>
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <CustomLink href="#features" variant="nav" className="text-sm">Características</CustomLink>
            <CustomLink href="#" variant="nav" className="text-sm">Precios</CustomLink>
            <CustomLink href="#contact" variant="nav" className="text-sm">Contacto</CustomLink>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/auth/signup" className="hidden sm:inline-flex px-5 py-2 text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity">
              Demo Gratis
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay - Debe ir ANTES del menú para estar debajo */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Slides from right - z-index más alto */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[var(--card)] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <div className="flex flex-col gap-6">
            <CustomLink 
              href="#features" 
              variant="nav" 
              className="text-base py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Características
            </CustomLink>
            <CustomLink 
              href="#" 
              variant="nav" 
              className="text-base py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Precios
            </CustomLink>
            <CustomLink 
              href="#contact" 
              variant="nav" 
              className="text-base py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </CustomLink>
          </div>
          
          <div className="mt-8 flex flex-col gap-3">
            <Link 
              href="/auth/login"
              className="w-full px-4 py-3 text-sm font-medium text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/auth/signup"
              className="w-full px-4 py-3 text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo Gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
