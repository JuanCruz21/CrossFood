"use client"

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        setError("");
        if (!email) return setError("El email es obligatorio");
        if (!password) return setError("La contraseña es obligatoria");

        // Simula envío
        console.log({ email, password, remember });
        // Aquí redirigirías o llamarías a la API
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
            <div className="w-full max-w-md bg-white dark:bg-background dark:text-foreground rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-4">Iniciar Sesión</h2>

                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

                <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="login-email" className="text-sm mb-1">Email</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-2 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="correo@ejemplo.com"
                    />

                    <label htmlFor="login-password" className="text-sm mb-1">Contraseña</label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Contraseña"
                    />

                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm flex items-center">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="mr-2"
                            />
                            Recuérdame
                        </label>

                        <a href="#" className="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition"
                    >
                        Iniciar Sesión
                    </button>

                    <p className="mt-4 text-sm">
                        ¿No tienes cuenta? <a href="/signup" className="text-blue-600 hover:underline">Crear una cuenta</a>
                    </p>
                </form>
            </div>
        </div>
    );
}