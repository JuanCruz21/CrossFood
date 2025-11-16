"use client";
import React from 'react';
import { Button } from 'app/ui/buttons';
import { Input, TextArea } from 'app/ui/input';
import { Select } from 'app/ui/select';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria, api, getRestaurantesByEmpresa } from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from 'app/types/product';

// Valores dinámicos: se obtendrán desde el usuario actual o selector

export default function Categories() {
    const addCategoryPopup = usePopup();
    const editCategoryPopup = usePopup();
    const deleteCategoryPopup = usePopup();
    const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
    const [restaurantes, setRestaurantes] = useState<any[]>([]); 
    const [empresaId, setEmpresaId] = useState<string>('');
    const [restauranteId, setRestauranteId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [formData, setFormData] = useState<CategoriaCreate>({
        nombre: '',
        descripcion: '',
        restaurante_id: '',
        categoria_id: '',
    });

    // Cargar categorías al montar el componente: obtener primero info de usuario
    useEffect(() => {
        (async () => {
            await handleGetUserInfo();
        })();
    }, []);

    // Obtener lista de categorías
    async function fetchListCategories() {
        try {
            const response = await getCategorias(restauranteId);
            if (response.data) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            toast.error("Error al cargar categorías");
        }
    }

    // Crear nueva categoría
    async function handleCreateCategory() {
        setIsLoading(true);
        try {
            const payload: any = { ...formData };
            Object.keys(payload).forEach((k) => {
                if (payload[k] === '') delete payload[k];
            });
            await createCategoria(payload);
            toast.success("Categoría creada correctamente");
            await fetchListCategories();
            addCategoryPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al crear categoría:', error);
            toast.error("Error al crear categoría");
        } finally {
            setIsLoading(false);
        }
    }
    // Obtener información del usuario (si es necesario)
    async function handleGetUserInfo() {
        const response = await api.post('/login/test-token');
        if (response.data) {
            const empId = response.data.empresa_id || '';
            const restId = response.data.restaurante_id || '';
            setEmpresaId(empId);
            setRestauranteId(restId);
            setFormData((prev) => ({ ...prev, restaurante_id: restId }));
            await fetchGetRestaurantes(empId);
            await fetchListCategories();
        }
        return null;
    }

    // Obtener lista de restaurantes por empresa
    async function fetchGetRestaurantes(empresa_id?: string) {
        try {
            const idToUse = empresa_id ?? empresaId;
            if (!idToUse) return setRestaurantes([]);
            const response = await getRestaurantesByEmpresa(idToUse);
            if (response.data) {
                setRestaurantes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener restaurantes:', error);
        }
    }
    // Actualizar categoría existente
    async function handleUpdateCategory() {
        if (!selectedCategory) return;
        
        setIsLoading(true);
        try {
            const updateData: CategoriaUpdate = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
            };
            const payload: any = { ...updateData };
            Object.keys(payload).forEach((k) => {
                if (payload[k] === '') delete payload[k];
            });
            await updateCategoria(selectedCategory.id, payload);
            toast.success("Categoría actualizada correctamente");
            await fetchListCategories();
            editCategoryPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            toast.error("Error al actualizar categoría");
        } finally {
            setIsLoading(false);
        }
    }

    // Eliminar categoría
    async function handleDeleteCategory() {
        if (!selectedCategory) return;
        
        setIsLoading(true);
        try {
            await deleteCategoria(selectedCategory.id);
            toast.success("Categoría eliminada correctamente");
            await fetchListCategories();
            deleteCategoryPopup.close();
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            toast.error("Error al eliminar categoría");
        } finally {
            setIsLoading(false);
        }
    }

    // Abrir modal de edición
    function openEditModal(category: Categoria) {
        setSelectedCategory(category);
        setFormData({
            nombre: category.nombre,
            descripcion: category.descripcion || '',
            restaurante_id: category.restaurante_id,
            categoria_id: category.categoria_id,
        });
        editCategoryPopup.open();
    }

    // Abrir modal de eliminación
    function openDeleteModal(category: Categoria) {
        setSelectedCategory(category);
        deleteCategoryPopup.open();
    }

    // Resetear formulario
    function resetForm() {
        setFormData({
            nombre: '',
            descripcion: '',
            restaurante_id: restauranteId,
            categoria_id: '',
        });
        setSelectedCategory(null);
    }

    // Manejar cierre de modal de agregar
    function handleCloseAddModal() {
        addCategoryPopup.close();
        resetForm();
    }

    // Manejar cierre de modal de editar
    function handleCloseEditModal() {
        editCategoryPopup.close();
        resetForm();
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
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">{cat.nombre}</td>
                                            <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{cat.descripcion || '-'}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => openEditModal(cat)}
                                                    >Editar</Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openDeleteModal(cat)}
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

            {/* Modal para agregar categoría */}
            <Popup 
                isOpen={addCategoryPopup.isOpen}
                onClose={handleCloseAddModal}
                title="Nueva Categoría"
                description="Crea una nueva categoría para el menú"
                onConfirm={handleCreateCategory}
                confirmText="Crear Categoría"
                isLoading={isLoading}
                size="xl"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }}>
                    <div>
                        <Input 
                            id="categoryName"
                            label="Nombre de la Categoría"  
                            placeholder="Ingresa el nombre de la categoría" 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                setFormData({ ...formData, nombre: e.target.value })
                            }
                            value={formData.nombre}
                            required
                        />
                        <TextArea 
                            id="categoryDescription"
                            label="Descripción"
                            placeholder="Ingresa una descripción (opcional)"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                setFormData({ ...formData, descripcion: e.target.value })
                            }
                            value={formData.descripcion} 
                        />
                        <Select
                            id="editCategoryParent"
                            label="Categoría Padre"
                            options={[
                                { value: '', label: 'Ninguna' },
                                ...categories
                                    .filter(cat => cat.id !== selectedCategory?.id) // Excluir la categoría actual
                                    .map(cat => ({ value: cat.id, label: cat.nombre }))
                            ]}
                            value={formData.categoria_id || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFormData({ ...formData, categoria_id: e.target.value })
                            }
                        />
                        <Select
                            id="editCategoryRestaurant"
                            label="Restaurante"
                            options={[
                                { value: '', label: 'Ninguno' },
                                ...restaurantes.map(r => ({ value: r.id, label: r.nombre }))
                            ]}
                            value={formData.restaurante_id || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFormData({ ...formData, restaurante_id: e.target.value })
                            }
                        />
                    </div>
                </form>
            </Popup>

            {/* Modal para editar categoría */}
            <Popup 
                isOpen={editCategoryPopup.isOpen}
                onClose={handleCloseEditModal}
                title="Editar Categoría"
                description="Modifica los datos de la categoría"
                onConfirm={handleUpdateCategory}
                confirmText="Guardar Cambios"
                isLoading={isLoading}
                size="xl"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateCategory(); }}>
                    <div>
                        <Input 
                            id="editCategoryName"
                            label="Nombre de la Categoría"  
                            placeholder="Ingresa el nombre de la categoría" 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                setFormData({ ...formData, nombre: e.target.value })
                            }
                            value={formData.nombre}
                            required
                        />
                        <TextArea 
                            id="editCategoryDescription"
                            label="Descripción"
                            placeholder="Ingresa una descripción (opcional)"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                setFormData({ ...formData, descripcion: e.target.value })
                            }
                            value={formData.descripcion} 
                        />
                        <Select
                            id="editCategoryParent"
                            label="Categoría Padre"
                            options={[
                                { value: '', label: 'Ninguna' },
                                ...categories
                                    .filter(cat => cat.id !== selectedCategory?.id) // Excluir la categoría actual
                                    .map(cat => ({ value: cat.id, label: cat.nombre }))
                            ]}
                            value={formData.categoria_id || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFormData({ ...formData, categoria_id: e.target.value })
                            }
                        />
                        <Select
                            id="editCategoryRestaurant"
                            label="Restaurante"
                            options={[
                                { value: '', label: 'Ninguno' },
                                ...restaurantes.map(r => ({ value: r.id, label: r.nombre }))
                            ]}
                            value={formData.restaurante_id || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFormData({ ...formData, restaurante_id: e.target.value })
                            }
                        />
                    </div>
                </form>
            </Popup>

            {/* Modal de confirmación para eliminar */}
            <AlertPopup
                isOpen={deleteCategoryPopup.isOpen}
                onClose={deleteCategoryPopup.close}
                onConfirm={handleDeleteCategory}
                title="Eliminar Categoría"
                message={`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="error"
            />
            {/* Toast container - react-toastify */}
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </>
    )
}
