import { QrCode } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contacto" className="py-12 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              cross<span className="text-primary">Food</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Características
            </a>
            <a href="#caracteristicas" className="hover:text-primary transition-colors">
              Características
            </a>
            <a href="#precios" className="hover:text-primary transition-colors">
              Precios
            </a>
            <a href="#soporte" className="hover:text-primary transition-colors">
              Soporte
            </a>
            <a href="#contacto" className="hover:text-primary transition-colors">
              Contacto
            </a>
          </div>

          <div className="text-sm text-muted-foreground">
            © 2025 crossFood. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}