import Image from "next/image";
import React from "react";
import {LinkPrimary, LinkSecondary} from "../components/link";

export default function Header() {
    return (
    <header className="bg-background dark:bg-background shadow-md sticky top-0 z-50">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
            <a className="block text-foreground" href="#">
                <span className="sr-only">Home</span>
                <Image
                className="h-20 w-auto"
                width={32}
                height={32}
                src="/faviconOscuro.svg"
                alt="Logo"
                />
            </a>

            <div className="flex flex-1 items-center justify-end md:justify-between">
                <nav aria-label="Global" className="hidden md:block">
                <ul className="flex items-center gap-6 text-sm">
                    <li>
                    <a
                        className="text-foreground transition hover:text-foreground/75"
                        href="#inicio"
                    >
                        Inicio
                    </a>
                    </li>

                    <li>
                    <a
                        className="text-foreground transition hover:text-foreground/75"
                        href="#caracteristicas"
                    >
                        Características
                    </a>
                    </li>

                    <li>
                    <a
                        className="text-foreground transition hover:text-foreground/75"
                        href="#beneficios"
                    >
                        Beneficios
                    </a>
                    </li>

                    <li>
                    <a
                        className="text-foreground transition hover:text-foreground/75"
                        href="#como-funciona"
                    >
                        Cómo funciona
                    </a>
                    </li>

                    <li>
                    <a
                        className="text-foreground transition hover:text-foreground/75"
                        href="#contacto"
                    >
                        Contacto
                    </a>
                    </li>
                </ul>
                </nav>

                <div className="flex items-center gap-4">
                <div className="sm:flex sm:gap-4">
                    <LinkPrimary href="/login" styles="hidden sm:block" children="Ingreso"/>
                    <LinkSecondary href="/signup" styles="hidden sm:block" children="Registro"/>
                </div>

                <button
                    className="block rounded-sm bg-naranja-claro px-5 py-2.5 text-foreground transition hover:text-foreground/75 md:hidden"
                >
                    <span className="sr-only">Toggle menu</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                </div>
            </div>
            </div>
        </header>
    );
}
