# Sistema de Navegación - Sidebar Responsive

## Descripción

El sistema de navegación de crossFood incluye un **sidebar lateral izquierdo** completamente responsive que funciona como menú principal de la aplicación. El sidebar soporta tanto enlaces directos como menús desplegables anidados.

## Características

### ✨ Funcionalidades Principales

- **100% Responsive**: Se adapta perfectamente a dispositivos móviles, tablets y desktop
- **Enlaces Directos**: Navegación rápida a páginas principales
- **Menús Desplegables**: Organización jerárquica de páginas relacionadas
- **Overlay en Móvil**: Capa semitransparente para cerrar el menú en dispositivos móviles
- **Animaciones Suaves**: Transiciones fluidas al abrir/cerrar menú y submenús
- **Temas Dark/Light**: Compatible con el sistema de temas de la aplicación
- **Iconos Lucide**: Iconografía moderna y consistente

### 📱 Comportamiento Responsive

#### Desktop (≥1024px)
- Sidebar siempre visible en la izquierda
- Ancho fijo de 288px (w-72)
- No requiere botón de apertura

#### Móvil y Tablet (<1024px)
- Sidebar oculto por defecto
- Se abre desde la izquierda con animación
- Overlay oscuro sobre el contenido
- Botón de hamburguesa en el header para abrir
- Botón X en el sidebar para cerrar
- Cierre automático al hacer clic en un enlace

## Estructura de Archivos

```
app/src/app/
├── components/
│   ├── sidebar.tsx          # Componente principal del sidebar
│   └── menu-button.tsx      # Botón hamburguesa para móvil
└── home/
    └── layout.tsx           # Layout que integra el sidebar
```

## Configuración del Menú

El menú se configura en `sidebar.tsx` mediante el array `menuItems`:

```typescript
const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/home",
    icon: Home,  // Enlace directo
  },
  {
    title: "Pedidos",
    icon: ShoppingCart,
    children: [  // Menú desplegable
      { title: "Todos los Pedidos", href: "/home/pedidos" },
      { title: "Pendientes", href: "/home/pedidos/pendientes" },
    ],
  },
]
```

### Interfaz MenuItem

```typescript
interface MenuItem {
  title: string              // Texto del menú
  href?: string             // URL para enlaces directos
  icon?: React.ComponentType // Componente de icono (opcional)
  children?: MenuItem[]     // Submenús (opcional)
}
```

## Cómo Agregar Nuevas Páginas

### 1. Enlace Directo

```typescript
{
  title: "Nueva Página",
  href: "/home/nueva-pagina",
  icon: IconoComponente,
}
```

### 2. Menú Desplegable

```typescript
{
  title: "Nueva Sección",
  icon: IconoComponente,
  children: [
    { title: "Subsección 1", href: "/home/seccion/sub1" },
    { title: "Subsección 2", href: "/home/seccion/sub2" },
  ],
}
```

### 3. Crear la Página

Crea el archivo correspondiente en la estructura de rutas:

```bash
# Para /home/nueva-pagina
app/src/app/home/nueva-pagina/page.tsx

# Para /home/seccion/sub1
app/src/app/home/seccion/sub1/page.tsx
```

## Estructura del Sidebar

### Header
- Logo de crossFood
- Botón de cierre (solo móvil)

### Navegación
- Lista de menús y submenús
- Indicadores visuales de expansión (ChevronRight/ChevronDown)
- Colores semánticos (primary para iconos, hover states)

### Footer
- Avatar/iniciales del usuario
- Nombre y email
- Fijo en la parte inferior

## Personalización

### Colores

El sidebar usa las variables CSS del sistema de temas:

```css
--background      /* Fondo principal */
--card           /* Fondo del sidebar */
--border         /* Bordes */
--foreground     /* Texto principal */
--muted          /* Hover states */
--primary        /* Iconos y acentos */
```

### Iconos

Importa iconos desde `lucide-react`:

```typescript
import { Home, ShoppingCart, Package } from "lucide-react"
```

### Ancho del Sidebar

Para cambiar el ancho, modifica la clase en `sidebar.tsx`:

```typescript
// Actual: w-72 (288px)
className="... w-72 ..."

// Ejemplo: w-64 (256px) o w-80 (320px)
```

## Rutas Actuales Implementadas

### Nivel 1 (Enlaces Directos)
- `/home` - Dashboard principal
- `/home/mesas` - Gestión de mesas

### Nivel 2 (Submenús)
- **Pedidos**
  - `/home/pedidos` - Todos los pedidos
  - `/home/pedidos/pendientes` - Pendientes
  - `/home/pedidos/preparacion` - En preparación
  - `/home/pedidos/completados` - Completados

- **Menú**
  - `/home/menu/productos` - Gestión de productos
  - `/home/menu/categorias` - Categorías
  - `/home/menu/disponibilidad` - Control de disponibilidad

- **Facturación**
  - `/home/facturacion/facturas` - Facturas
  - `/home/facturacion/pagos` - Pagos
  - `/home/facturacion/rectificativas` - Facturas rectificativas

- **Reportes**
  - `/home/reportes/ventas` - Reportes de ventas
  - `/home/reportes/productos` - Productos populares
  - `/home/reportes/desempeno` - Análisis de desempeño

- **Configuración**
  - `/home/configuracion/perfil` - Perfil de usuario
  - `/home/configuracion/restaurante` - Datos del restaurante
  - `/home/configuracion/usuarios` - Gestión de usuarios
  - `/home/configuracion/impuestos` - Configuración de impuestos

## Uso del Layout

El `HomeLayout` envuelve todas las páginas bajo `/home`:

```typescript
// app/src/app/home/layout.tsx
export default function HomeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1">
        <header>
          <MenuButton onClick={() => setSidebarOpen(true)} />
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
```

## Mejoras Futuras

- [ ] Breadcrumbs en el header basados en la ruta actual
- [ ] Destacar el ítem activo según la URL
- [ ] Guardar estado de menús expandidos en localStorage
- [ ] Modo compacto del sidebar (solo iconos)
- [ ] Búsqueda rápida de páginas (⌘+K)
- [ ] Badges con contadores (ej: pedidos pendientes)
- [ ] Soporte para múltiples niveles de anidación
- [ ] Arrastrar y soltar para reordenar menús (admin)

## Ejemplo de Uso

```typescript
// En cualquier página dentro de /home
export default function MiPagina() {
  return (
    <div className="space-y-6">
      <h1>Mi Página</h1>
      {/* El sidebar se muestra automáticamente */}
    </div>
  )
}
```

## Soporte y Documentación

Para más información sobre:
- **Next.js Layouts**: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
- **Lucide Icons**: https://lucide.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
