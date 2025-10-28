import Image from "next/image";
import { LinkPrimary,LinkSecondary } from "../components/link";

export default function Hero() {
    return (
        <div>
        <section id="inicio" className="bg-background lg:grid lg:h-screen lg:place-content-center">
                <div
                    className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-2 md:items-center md:gap-4 lg:px-8 lg:py-32"
                >
                    <div className="max-w-prose text-left">
                    <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
                        Conectamos a tu restaurante con clientes para
                        <strong className="text-naranja-apagado"> aumentar </strong>
                        conversiones
                    </h1>

                    <p className="mt-4 text-base text-pretty text-naranja-claro sm:text-lg/relaxed">
                        Nuestra plataforma intuitiva facilita a los clientes
                        descubrir y pedir en tu restaurante, impulsando las
                        ventas y mejorando la satisfacción del cliente.
                    </p>

                    <div className="mt-4 flex gap-4 sm:mt-6">
                        <LinkPrimary href="#!" styles="" children="Comenzar Ahora"/>
                        <LinkSecondary href="#!" styles="" children="Aprender Más"/>
                    </div>
                    </div>
                    <Image
                        className="h-120 w-auto"
                        width={100}
                        height={100}
                        src="/hero.svg"
                        alt="Logo"
                    />
                </div>
            </section>
        </div>
    );
}