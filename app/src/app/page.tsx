import Header from "./page/header";
import Hero from "./page/hero";
import { Footer } from "./page/footer";
import { Features } from "./page/features";
import { HowItWorks } from "./page/how-it-works";
import { Metadata } from "next";
import { Benefits } from "./page/benefits";

export const metadata: Metadata = {
  title: "crossFood - Sistema de Pedidos con QR para Restaurantes",
  description: "Revoluciona tu restaurante con nuestro sistema completo de gestión de pedidos mediante QR. Desde el escaneo hasta la facturación en tiempo real."
};

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <Benefits />
      <HowItWorks />
      <Footer />
    </div>
  );
}
