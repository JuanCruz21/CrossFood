"use client";

import React, { useState, useEffect } from 'react';
import { Button } from 'app/ui/buttons';
import { Input, TextArea } from 'app/ui/input';
import { getTasasImpositivas, createTasaImpositiva, updateTasaImpositiva, deleteTasaImpositiva } from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { TasaImpositiva, TasaImpositivaCreate, TasaImpositivaUpdate } from 'app/types/product';

export default function TasaImpositivaPage() {
    const addPopup = usePopup();
    const editPopup = usePopup();
    const deletePopup = usePopup();
    
    const [selectedTasa, setSelectedTasa] = useState<TasaImpositiva | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tasas, setTasas] = useState<TasaImpositiva[]>([]);
    const [formData, setFormData] = useState<TasaImpositivaCreate>({
        nombre: '',
        porcentaje: 0,
        descripcion: '',
    });

    useEffect(() => {
        fetchTasas();
    }, []);

    async function fetchTasas() {
        try {
            const response = await getTasasImpositivas();
            if (response.data) {
                setTasas(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener tasas:', error);
            toast.error("Error al cargar tasas impositivas");
        }
    }

    async function handleCreate() {
        setIsLoading(true);
        try {
            await createTasaImpositiva(formData);
            toast.success("Tasa creada correctamente");
            await fetchTasas();
            addPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al crear tasa:', error);
            toast.error("Error al crear tasa");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUpdate() {
        if (!selectedTasa) return;
        
        setIsLoading(true);
        try {
            const updateData: TasaImpositivaUpdate = {
                nombre: formData.nombre,
                porcentaje: formData.porcentaje,
                descripcion: formData.descripcion,
            };
            await updateTasaImpositiva(selectedTasa.id, updateData);
            toast.success("Tasa actualizada correctamente");
            await fetchTasas();
            editPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al actualizar tasa:', error);
            toast.error("Error al actualizar tasa");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!selectedTasa) return;
        
        setIsLoading(true);
        try {
            await deleteTasaImpositiva(selectedTasa.id);
            toast.success("Tasa eliminada correctamente");
            await fetchTasas();
            deletePopup.close();
            setSelectedTasa(null);
        } catch (error) {
            console.error('Error al eliminar tasa:', error);
            toast.error("Error al eliminar tasa");
        } finally {
            setIsLoading(false);
        }
    }

    function openEditModal(tasa: TasaImpositiva) {
        setSelectedTasa(tasa);
        setFormData({
            nombre: tasa.nombre,
            porcentaje: tasa.porcentaje,
            descripcion: tasa.descripcion || '',
        });
        editPopup.open();
    }

    function openDeleteModal(tasa: TasaImpositiva) {
        setSelectedTasa(tasa);
        deletePopup.open();
    }

    function resetForm() {
        setFormData({
            nombre: '',
            porcentaje: 0,
            descripcion: '',
        });
        setSelectedTasa(null);
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Tasas Impositivas</h1>
                    <p className="text-[var(--muted-foreground)]">Gestiona las tasas impositivas del sistema</p>
                </div>
                <Button onClick={addPopup.open} variant="primary">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Tasa
                </Button>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--muted)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Porcentaje</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Descripción</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {tasas.map((tasa) => (
                                <tr key={tasa.id} className="hover:bg-[var(--muted)]/50">
                                    <td className="px-6 py-4 text-sm font-medium">{tasa.nombre}</td>
                                    <td className="px-6 py-4 text-sm">{tasa.porcentaje}%</td>
                                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                                        {tasa.descripcion || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" onClick={() => openEditModal(tasa)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" onClick={() => openDeleteModal(tasa)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Popup
                isOpen={addPopup.isOpen}
                onClose={() => { addPopup.close(); resetForm(); }}
                title="Nueva Tasa Impositiva"
                onConfirm={handleCreate}
                confirmText="Crear"
                isLoading={isLoading}
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                    <Input
                        label="Nombre"
                        value={formData.nombre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    <Input
                        label="Porcentaje"
                        type="number"
                        step="0.01"
                        value={formData.porcentaje.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, porcentaje: parseFloat(e.target.value) || 0 })}
                        required
                    />
                    <TextArea
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                            setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </form>
            </Popup>

            <Popup
                isOpen={editPopup.isOpen}
                onClose={() => { editPopup.close(); resetForm(); }}
                title="Editar Tasa Impositiva"
                onConfirm={handleUpdate}
                confirmText="Guardar"
                isLoading={isLoading}
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                    <Input
                        label="Nombre"
                        value={formData.nombre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    <Input
                        label="Porcentaje"
                        type="number"
                        step="0.01"
                        value={formData.porcentaje.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, porcentaje: parseFloat(e.target.value) || 0 })}
                        required
                    />
                    <TextArea
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                            setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </form>
            </Popup>

            <AlertPopup
                isOpen={deletePopup.isOpen}
                onClose={deletePopup.close}
                onConfirm={handleDelete}
                title="Eliminar Tasa"
                message={`¿Eliminar la tasa "${selectedTasa?.nombre}"?`}
                confirmText="Eliminar"
                type="error"
            />

            <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
}
