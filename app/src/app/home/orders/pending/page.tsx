
export default function Stats() {
  return (
    <>
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Pedidos Activos</h2>
          <p className="text-[var(--muted-foreground)] mt-1">
            Gestiona los pedidos en proceso
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity font-medium">
          + Nuevo Pedido
        </button>
      </div>
      </div>
    </>
  )
}