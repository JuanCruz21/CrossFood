"use client"

import { QrCode, Menu, ChefHat, Receipt, AlertCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const steps = [
  {
    icon: QrCode,
    number: "01",
    title: "Cliente Escanea QR",
    description: "Cada mesa tiene un código QR único que abre el menú digital instantáneamente.",
  },
  {
    icon: Menu,
    number: "02",
    title: "Hace su Pedido",
    description: "El cliente navega el menú y crea su pedido con detalles específicos.",
  },
  {
    icon: ChefHat,
    number: "03",
    title: "Cocina en Tiempo Real",
    description: "La cocina recibe el pedido al instante y puede actualizar su estado.",
  },
  {
    icon: Receipt,
    number: "04",
    title: "Pago y Facturación",
    description: "Al pagar se genera la factura automáticamente y la mesa queda libre.",
  },
  {
    icon: AlertCircle,
    number: "05",
    title: "Gestión de Errores",
    description: "Si hay algún error, el sistema crea facturas rectificativas automáticamente.",
  },
]

export function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => {
                  const newVisible = [...prev]
                  newVisible[index] = true
                  return newVisible
                })
              }, index * 200)
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
    <section id="como-funciona" ref={sectionRef} className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">¿Cómo funciona crossFood?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Un flujo simple y eficiente que transforma la experiencia de tu restaurante
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-6 mb-12 last:mb-0 transition-all duration-700 ${
                visibleSteps[index] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
            >
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center w-12">
                  <div className="w-1 h-full bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
