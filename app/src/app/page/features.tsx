"use client"

import { Zap, Users, TrendingUp, Shield } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
  {
    icon: Zap,
    title: "Pedidos Instantáneos",
    description: "Los clientes hacen pedidos directamente desde su mesa sin esperar al mesero.",
  },
  {
    icon: Users,
    title: "Gestión en Tiempo Real",
    description: "La cocina recibe y actualiza pedidos al instante, mejorando la eficiencia.",
  },
  {
    icon: TrendingUp,
    title: "Aumenta tus Ventas",
    description: "Reduce tiempos de espera y mejora la experiencia del cliente.",
  },
  {
    icon: Shield,
    title: "Facturación Automática",
    description: "Genera facturas y rectificativas automáticamente con cada pago.",
  },
]

export function Features() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => {
                  const newVisible = [...prev]
                  newVisible[index] = true
                  return newVisible
                })
              }, index * 150)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="caracteristicas" ref={sectionRef} className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Todo lo que necesitas en una plataforma</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Simplifica la operación de tu restaurante con tecnología de vanguardia
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                visibleCards[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="mb-6 inline-block p-4 rounded-xl bg-primary/10">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
