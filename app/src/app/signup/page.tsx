"use client"

import { useState } from "react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [company, setCompany] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState("");

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "El nombre es obligatorio";
        if (!email.trim()) e.email = "El email es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email no válido";
        if (!password) e.password = "La contraseña es obligatoria";
        else if (password.length < 6) e.password = "La contraseña debe tener al menos 6 caracteres";
        if (password !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
        if (!acceptTerms) e.acceptTerms = "Debes aceptar los términos y condiciones";
        return e;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        setSuccess("");
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length === 0) {
            // Simular envío
            console.log({ name, email, password, company });
            setSuccess("Registro completado correctamente. Revisa tu email para confirmar.");
            // Reset form (opcional)
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setCompany("");
            setAcceptTerms(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
            <div className="w-full max-w-md bg-white dark:bg-background dark:text-foreground rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-4">Registro</h2>

                {success ? (
                    <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{success}</div>
                ) : null}

                <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
                    <label className="text-sm mb-1">Nombre completo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-2 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Tu nombre"
                    />
                    {errors.name && <div className="text-xs text-red-600 mb-2">{errors.name}</div>}

                    <label className="text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-2 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="correo@ejemplo.com"
                    />
                    {errors.email && <div className="text-xs text-red-600 mb-2">{errors.email}</div>}

                    <label className="text-sm mb-1">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-2 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Contraseña"
                    />
                    {errors.password && <div className="text-xs text-red-600 mb-2">{errors.password}</div>}

                    <label className="text-sm mb-1">Confirmar contraseña</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-2 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Repite la contraseña"
                    />
                    {errors.confirmPassword && <div className="text-xs text-red-600 mb-2">{errors.confirmPassword}</div>}

                    <label className="text-sm mb-1">Empresa (opcional)</label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="Nombre de la empresa"
                    />

                    <label className="flex items-center text-sm mb-4">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mr-2"
                        />
                        Acepto los términos y condiciones
                    </label>
                    {errors.acceptTerms && <div className="text-xs text-red-600 mb-2">{errors.acceptTerms}</div>}

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-2 hover:from-indigo-600 hover:to-blue-600 transition"
                    >
                        Crear cuenta
                    </button>

                    <p className="text-sm text-gray-700 dark:text-muted-foreground mt-4">
                        ¿Ya tienes cuenta? <a href="/login" className="text-blue-500 hover:underline">Inicia sesión</a>
                    </p>
                </form>
            </div>
        </div>
    );
}