"use client"

import { Clock, DollarSign, Smile, BarChart3 } from "lucide-react"

const benefits = [
  {
    icon: Clock,
    stat: "60%",
    label: "Menos tiempo de espera",
  },
  {
    icon: DollarSign,
    stat: "35%",
    label: "Aumento en ventas",
  },
  {
    icon: Smile,
    stat: "95%",
    label: "Satisfacción del cliente",
  },
  {
    icon: BarChart3,
    stat: "100%",
    label: "Control en tiempo real",
  },
]

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
  <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Resultados que hablan por sí solos</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto text-pretty">
            Restaurantes que usan crossFood ven mejoras inmediatas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all hover:scale-105"
            >
              <div className="inline-block p-4 rounded-xl bg-primary-foreground/20 mb-6">
                <benefit.icon className="w-10 h-10" />
              </div>
              <div className="text-5xl font-bold mb-2">{benefit.stat}</div>
              <div className="text-lg text-primary-foreground/80">{benefit.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
