import { Metadata } from "next";
import { Header } from "./landing/header";
import { Hero } from "./landing/hero";
import { Features } from "./landing/features";
import { CTA } from "./landing/cta";
import { Footer } from "./landing/footer";
import { SmoothScroll } from "./components/SmoothScroll";

export const metadata: Metadata = {
  title: "CrossFood - Sistema de Pedidos con QR para Restaurantes",
  description: "Revoluciona tu restaurante con nuestro sistema completo de gestión de pedidos mediante QR. Desde el escaneo hasta la facturación en tiempo real."
};

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
