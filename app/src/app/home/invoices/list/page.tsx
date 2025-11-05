export default function List() {
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Usuarios Asociados</h2>
                <p className="text-[var(--muted-foreground)] mt-1">
                    Gestiona los usuarios asociados a tu empresa desde Aquí.
                </p>
                </div>
                <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium">
                + Nuevo Usuario
                </button>
            </div>
        </>
    )
}