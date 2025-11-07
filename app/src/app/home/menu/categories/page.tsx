"use client";
import React from 'react';
import { Button } from 'app/ui/buttons';
import { Input, TextArea } from 'app/ui/input';
import { apiRequest } from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Categories() {
    const addCategoryPopup = usePopup();
    const editCategoryPopup = usePopup();
    const deleteCategoryPopup = usePopup();
    const [category, setCategory] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [data, setData] = useState<any>({
        name: '',
        description: '',
    });
    function fetchListCategories() {
        // Lógica para obtener las categorías desde la API
        apiRequest('/categories', {
            method: 'GET',
            useAuth: true,
            contentType: 'application/json',
        }).then(response => {
            toast.success("Categorías cargadas correctamente");
            // apiRequest likely returns an object with a `data` property; use it if present.
            setCategories(response?.data ?? response);
        }).catch(error => {
            console.error('Error al obtener categorías:', error);
            toast.error("Error al cargar categorías");
        });
    }
    useEffect(() => {
        fetchListCategories();
    }, []);
    

    async function fetchCreateCategory(data: any) {
        // Lógica para crear una nueva categoría
        // Devuelve la promesa para que el llamador pueda await/handle errors
        return apiRequest('/categories', {
            method: 'POST',
            useAuth: true,
            contentType: 'application/json',
            body: JSON.stringify(data),
        }).then(response => {
            toast.success("Categoría creada correctamente");
            fetchListCategories(); // Refrescar la lista de categorías
            return response;
        }).catch(error => {
            console.error('Error al crear categoría:', error);
            // Re-lanzar para que el llamador pueda manejarlo si usa await
            toast.error("Error al crear categoría");
            throw error;
        });
    }
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Categorías de Menú</h1>
                    <p>Aquí puedes gestionar las categorías de tu menú.</p>
                </div>
                <Button
                    onClick={addCategoryPopup.open}
                    variant="primary"
                > <Plus className="mr-2" /> Nueva Categoría</Button>
            </div>

            <div className="mt-6">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--muted)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Nombre</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Descripción</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {categories && categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">{cat.name}</td>
                                            <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{cat.description}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => { setCategory(cat); editCategoryPopup.open(); }}
                                                    >Editar</Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => { setCategory(cat); deleteCategoryPopup.open(); }}
                                                    >Eliminar</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)] text-center">
                                            No hay categorías disponibles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Modal content for adding/editing a category */}
            <Popup 
                isOpen={addCategoryPopup.isOpen}
                onClose={addCategoryPopup.close}
                title={`Nueva Categoría`}
                description="Crea una nueva categoría para el menú"
                onConfirm={async () => {
                setIsLoading(true);
                try {
                    await fetchCreateCategory(data);
                    addCategoryPopup.close();
                } catch (err) {
                    // el error ya fue mostrado por fetchCreateCategory; opcionalmente loguearlo
                    console.error('Error creating category (onConfirm):', err);
                } finally {
                    setIsLoading(false);
                }
                }}
                confirmText="Guardar Cambios"
                isLoading={isLoading}
                size="xl"
            >
                <form className="space-y-4">
                    <div>
                        <Input 
                            id="categoryName"
                            label="Nombre de la Categoría"  
                            placeholder="Ingresa el nombre de la categoría" 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, name: e.target.value })}
                            value={data.name}
                        />
                        <TextArea 
                            id="categoryDescription"
                            label="Descripción"
                            placeholder="Ingresa una descripción"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, description: e.target.value })}
                            value={data.description} 
                        />
                    </div>
                </form>
            </Popup>
            {/* Toast container - react-toastify */}
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </>
    )
}
