"use client";
import React, { useState, useEffect } from 'react';
import { Button } from 'app/ui/buttons';
import { Input, TextArea } from 'app/ui/input';
import { 
    getTasasImpositivas,
    createTasaImpositiva,
    updateTasaImpositiva,
    deleteTasaImpositiva
} from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Plus, Edit, Trash2, Percent } from 'lucide-react';
import type { TasaImpositiva, TasaImpositivaCreate, TasaImpositivaUpdate } from 'app/types/product';

export default function Taxes() {
    const addTaxPopup = usePopup();
    const editTaxPopup = usePopup();
    const deleteTaxPopup = usePopup();
    
    const [selectedTax, setSelectedTax] = useState<TasaImpositiva | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [taxes, setTaxes] = useState<TasaImpositiva[]>([]);
    
    const [formData, setFormData] = useState<TasaImpositivaCreate>({
        nombre: '',
        porcentaje: 0,
        descripcion: '',
    });

    // Cargar tasas al montar
    useEffect(() => {
        fetchTaxes();
    }, []);

    // Obtener lista de tasas impositivas
    async function fetchTaxes() {
        try {
            const response = await getTasasImpositivas();
            if (response.data) {
                setTaxes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener tasas impositivas:', error);
            toast.error("Error al cargar tasas impositivas");
        }
    }

    // Crear nueva tasa impositiva
    async function handleCreateTax() {
        setIsLoading(true);
        try {
            await createTasaImpositiva(formData);
            toast.success("Tasa impositiva creada correctamente");
            await fetchTaxes();
            addTaxPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al crear tasa impositiva:', error);
            toast.error("Error al crear tasa impositiva");
        } finally {
            setIsLoading(false);
        }
    }

    // Actualizar tasa impositiva existente
    async function handleUpdateTax() {
        if (!selectedTax) return;
        
        setIsLoading(true);
        try {
            const updateData: TasaImpositivaUpdate = {
                nombre: formData.nombre,
                porcentaje: formData.porcentaje,
                descripcion: formData.descripcion,
            };
            
            await updateTasaImpositiva(selectedTax.id, updateData);
            toast.success("Tasa impositiva actualizada correctamente");
            await fetchTaxes();
            editTaxPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al actualizar tasa impositiva:', error);
            toast.error("Error al actualizar tasa impositiva");
        } finally {
            setIsLoading(false);
        }
    }

    // Eliminar tasa impositiva
    async function handleDeleteTax() {
        if (!selectedTax) return;
        
        setIsLoading(true);
        try {
            await deleteTasaImpositiva(selectedTax.id);
            toast.success("Tasa impositiva eliminada correctamente");
            await fetchTaxes();
            deleteTaxPopup.close();
            setSelectedTax(null);
        } catch (error) {
            console.error('Error al eliminar tasa impositiva:', error);
            toast.error("Error al eliminar tasa impositiva");
        } finally {
            setIsLoading(false);
        }
    }

    // Abrir modal de edición
    function openEditModal(tax: TasaImpositiva) {
        setSelectedTax(tax);
        setFormData({
            nombre: tax.nombre,
            porcentaje: tax.porcentaje,
            descripcion: tax.descripcion || '',
        });
        editTaxPopup.open();
    }

    // Abrir modal de eliminación
    function openDeleteModal(tax: TasaImpositiva) {
        setSelectedTax(tax);
        deleteTaxPopup.open();
    }

    // Resetear formulario
    function resetForm() {
        setFormData({
            nombre: '',
            porcentaje: 0,
            descripcion: '',
        });
        setSelectedTax(null);
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">Impuestos</h2>
                        <p className="text-[var(--muted-foreground)] mt-1">
                            Gestiona las tasas impositivas de tu restaurante
                        </p>
                    </div>
                    <Button
                        onClick={addTaxPopup.open}
                        variant="primary"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Tasa Impositiva
                    </Button>
                </div>

                {/* Tabla de tasas impositivas */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--muted)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Nombre</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Porcentaje</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Descripción</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--foreground)]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {taxes && taxes.length > 0 ? (
                                    taxes.map((tax) => (
                                        <tr key={tax.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                                        <Percent className="w-5 h-5 text-[var(--primary)]" />
                                                    </div>
                                                    <div className="text-sm font-medium text-[var(--foreground)]">
                                                        {tax.nombre}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    {tax.porcentaje}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                                                {tax.descripcion || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => openEditModal(tax)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openDeleteModal(tax)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <Percent className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                                            <p className="text-sm text-[var(--muted-foreground)]">
                                                No hay tasas impositivas disponibles
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={addTaxPopup.open}
                                                className="mt-4"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Crear primera tasa
                                            </Button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para agregar tasa impositiva */}
            <Popup
                isOpen={addTaxPopup.isOpen}
                onClose={() => { addTaxPopup.close(); resetForm(); }}
                title="Nueva Tasa Impositiva"
                description="Crea una nueva tasa impositiva para tu restaurante"
                onConfirm={handleCreateTax}
                confirmText="Crear Tasa"
                isLoading={isLoading}
                size="lg"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateTax(); }}>
                    <Input
                        id="taxName"
                        label="Nombre de la Tasa"
                        placeholder="Ej: IVA, Impuesto al consumo"
                        value={formData.nombre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, nombre: e.target.value })
                        }
                        required
                    />
                    
                    <Input
                        id="taxPercentage"
                        label="Porcentaje"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={formData.porcentaje.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, porcentaje: parseFloat(e.target.value) || 0 })
                        }
                        required
                    />

                    <TextArea
                        id="taxDescription"
                        label="Descripción"
                        placeholder="Descripción de la tasa (opcional)"
                        value={formData.descripcion}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                            setFormData({ ...formData, descripcion: e.target.value })
                        }
                    />
                </form>
            </Popup>

            {/* Modal para editar tasa impositiva */}
            <Popup
                isOpen={editTaxPopup.isOpen}
                onClose={() => { editTaxPopup.close(); resetForm(); }}
                title="Editar Tasa Impositiva"
                description="Modifica la información de la tasa impositiva"
                onConfirm={handleUpdateTax}
                confirmText="Guardar Cambios"
                isLoading={isLoading}
                size="lg"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateTax(); }}>
                    <Input
                        id="editTaxName"
                        label="Nombre de la Tasa"
                        placeholder="Ej: IVA, Impuesto al consumo"
                        value={formData.nombre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, nombre: e.target.value })
                        }
                        required
                    />
                    
                    <Input
                        id="editTaxPercentage"
                        label="Porcentaje"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={formData.porcentaje.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, porcentaje: parseFloat(e.target.value) || 0 })
                        }
                        required
                    />

                    <TextArea
                        id="editTaxDescription"
                        label="Descripción"
                        placeholder="Descripción de la tasa (opcional)"
                        value={formData.descripcion}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                            setFormData({ ...formData, descripcion: e.target.value })
                        }
                    />
                </form>
            </Popup>

            {/* Modal de confirmación para eliminar */}
            <AlertPopup
                isOpen={deleteTaxPopup.isOpen}
                onClose={deleteTaxPopup.close}
                onConfirm={handleDeleteTax}
                title="Eliminar Tasa Impositiva"
                message={`¿Estás seguro de que deseas eliminar la tasa "${selectedTax?.nombre}"? Esta acción no se puede deshacer y podría afectar productos existentes.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="error"
            />

            <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
}