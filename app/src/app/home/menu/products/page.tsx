"use client";
import React, { useState, useEffect } from 'react';
import { Button } from 'app/ui/buttons';
import { Input, TextArea } from 'app/ui/input';
import { 
    getProductos, 
    createProducto, 
    updateProducto, 
    deleteProducto,
    updateProductoStock,
    getCategorias,
    getTasasImpositivas,
    api
} from 'app/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import { Popup, AlertPopup, usePopup } from 'app/ui/popUp';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import type { Producto, ProductoCreate, ProductoUpdate, Categoria } from 'app/types/product';

// TODO: Obtener de contexto o usuario actual
const RESTAURANTE_ID = "";
const EMPRESA_ID = "";

export default function Products() {
    const addProductPopup = usePopup();
    const editProductPopup = usePopup();
    const deleteProductPopup = usePopup();
    const stockPopup = usePopup();
    
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<Producto[]>([]);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [tasas, setTasas] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [empresaId, setEmpresaId] = useState<string>(EMPRESA_ID);
    
    const [formData, setFormData] = useState<ProductoCreate>({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        imagen: '',
        categoria_id: '',
        restaurante_id: RESTAURANTE_ID,
        empresa_id: EMPRESA_ID,
        tasa_impositiva_id: '',
    });
    
    const [stockUpdate, setStockUpdate] = useState<number>(0);

    // Cargar productos y categorías al montar
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchTasas();
        handleGetUserInfo();
    }, []);

    async function handleGetUserInfo() {
        const response = await api.post('/login/test-token');
        if (response.data) {
            const empId = response.data.empresa_id || '';
            const restId = response.data.restaurante_id || '';
            setEmpresaId(empId);
            setFormData((prev) => ({ ...prev, restaurante_id: restId, empresa_id: empId }));
        }
        return null;
    }

    // Recargar productos cuando cambia el filtro de categoría
    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    // Obtener lista de productos
    async function fetchProducts() {
        try {
            const response = await getProductos({
                restauranteId: RESTAURANTE_ID,
                empresaId: EMPRESA_ID,
                categoriaId: selectedCategory || undefined,
            });
            if (response.data) {
                setProducts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener productos:', error);
            toast.error("Error al cargar productos");
        }
    }

    // Obtener lista de categorías
    async function fetchCategories() {
        try {
            const response = await getCategorias(RESTAURANTE_ID);
            if (response.data) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            toast.error("Error al cargar categorías");
        }
    }

    async function fetchTasas() {
        try {
            const response = await getTasasImpositivas();
            if (response.data) {
                setTasas(response.data.data || []);
            }
        } catch (error) {
            console.error('Error al obtener tasas impositivas:', error);
        }
    }

    // Subir imagen con empresa_id
    async function uploadImage(file: File, empresaId: string): Promise<string> {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('empresa_id', empresaId);
        
        const response = await fetch(`${API_URL}/upload/producto`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
            },
            body: formDataUpload,
        });
        
        if (!response.ok) {
            throw new Error('Error al subir imagen');
        }
        
        const data = await response.json();
        return data.url;
    }

    // Crear nuevo producto
    async function handleCreateProduct() {
        setIsLoading(true);
        try {
            let imageUrl = formData.imagen;
            
            // Si hay archivo de imagen, subirlo primero
            if (imageFile) {
                const empresaIdToUse = formData.empresa_id || empresaId;
                if (!empresaIdToUse) {
                    toast.error("Debe seleccionar una empresa antes de subir una imagen");
                    setIsLoading(false);
                    return;
                }
                imageUrl = await uploadImage(imageFile, empresaIdToUse);
            }
            
            // sanitize payload: remove empty string fields so backend receives null/omitted
            const payload = { 
                ...formData, 
                imagen: imageUrl,
                empresa_id: formData.empresa_id || empresaId 
            } as any;
            Object.keys(payload).forEach((k) => {
                if (payload[k] === '') delete payload[k];
            });
            await createProducto(payload);
            toast.success("Producto creado correctamente");
            await fetchProducts();
            addProductPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al crear producto:', error);
            toast.error("Error al crear producto");
        } finally {
            setIsLoading(false);
        }
    }

    // Actualizar producto existente
    async function handleUpdateProduct() {
        if (!selectedProduct) return;
        
        setIsLoading(true);
        try {
            let imageUrl = formData.imagen;
            
            // Si hay nuevo archivo de imagen, subirlo
            if (imageFile) {
                const empresaIdToUse = formData.empresa_id || selectedProduct.empresa_id || empresaId;
                if (!empresaIdToUse) {
                    toast.error("No se pudo determinar la empresa del producto");
                    setIsLoading(false);
                    return;
                }
                imageUrl = await uploadImage(imageFile, empresaIdToUse);
            }
            
            const updateData: any = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: formData.precio,
                stock: formData.stock,
                imagen: imageUrl,
                categoria_id: formData.categoria_id,
                tasa_impositiva_id: formData.tasa_impositiva_id,
            };
            Object.keys(updateData).forEach((k) => {
                if (updateData[k] === '') delete updateData[k];
            });

            await updateProducto(selectedProduct.id, updateData);
            toast.success("Producto actualizado correctamente");
            await fetchProducts();
            editProductPopup.close();
            resetForm();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            toast.error("Error al actualizar producto");
        } finally {
            setIsLoading(false);
        }
    }

    // Actualizar stock del producto
    async function handleUpdateStock() {
        if (!selectedProduct) return;
        
        setIsLoading(true);
        try {
            await updateProductoStock(selectedProduct.id, stockUpdate);
            toast.success("Stock actualizado correctamente");
            await fetchProducts();
            stockPopup.close();
            setStockUpdate(0);
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            toast.error("Error al actualizar stock");
        } finally {
            setIsLoading(false);
        }
    }

    // Eliminar producto
    async function handleDeleteProduct() {
        if (!selectedProduct) return;
        
        setIsLoading(true);
        try {
            await deleteProducto(selectedProduct.id);
            toast.success("Producto eliminado correctamente");
            await fetchProducts();
            deleteProductPopup.close();
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            toast.error("Error al eliminar producto");
        } finally {
            setIsLoading(false);
        }
    }

    // Abrir modal de edición
    function openEditModal(product: Producto) {
        setSelectedProduct(product);
        setFormData({
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            precio: product.precio,
            stock: product.stock,
            imagen: product.imagen || '',
            categoria_id: product.categoria_id,
            restaurante_id: product.restaurante_id,
            empresa_id: product.empresa_id,
            tasa_impositiva_id: product.tasa_impositiva_id,
        });
        setImageFile(null);
        setImagePreview('');
        editProductPopup.open();
    }

    // Abrir modal de eliminación
    function openDeleteModal(product: Producto) {
        setSelectedProduct(product);
        deleteProductPopup.open();
    }

    // Abrir modal de actualización de stock
    function openStockModal(product: Producto) {
        setSelectedProduct(product);
        setStockUpdate(product.stock);
        stockPopup.open();
    }

    // Manejar selección de imagen
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    // Resetear formulario
    function resetForm() {
        setFormData({
            nombre: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            imagen: '',
            categoria_id: '',
            restaurante_id: RESTAURANTE_ID,
            empresa_id: empresaId || EMPRESA_ID,
            tasa_impositiva_id: undefined,
        });
        setSelectedProduct(null);
        setImageFile(null);
        setImagePreview('');
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Productos</h1>
                    <p className="text-[var(--muted-foreground)]">Gestiona el catálogo de productos de tu restaurante</p>
                </div>
                <Button
                    onClick={addProductPopup.open}
                    variant="primary"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                </Button>
            </div>

            {/* Filtro por categoría */}
            <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === '' ? 'primary' : 'outline'}
                        onClick={() => setSelectedCategory('')}
                    >
                        Todas
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? 'primary' : 'outline'}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.nombre}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--muted)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Producto</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Categoría</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Precio</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--foreground)]">Stock</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--foreground)]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {products && products.length > 0 ? (
                                products.map((product) => {
                                    const category = categories.find(c => c.id === product.categoria_id);
                                    return (
                                        <tr key={product.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {product.imagen ? (
                                                        <img 
                                                            src={product.imagen.startsWith('http') ? product.imagen : `http://localhost:8000${product.imagen}`}
                                                            alt={product.nombre}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-[var(--muted-foreground)]" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-[var(--foreground)]">
                                                            {product.nombre}
                                                        </div>
                                                        {product.descripcion && (
                                                            <div className="text-xs text-[var(--muted-foreground)]">
                                                                {product.descripcion}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                                                {category?.nombre || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">
                                                ${product.precio.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span 
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        product.stock === 0 
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : product.stock < 10
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    }`}
                                                >
                                                    {product.stock} unidades
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => openStockModal(product)}
                                                        title="Actualizar stock"
                                                    >
                                                        <Package className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => openEditModal(product)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openDeleteModal(product)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Package className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            No hay productos disponibles
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={addProductPopup.open}
                                            className="mt-4"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Crear primer producto
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para agregar producto */}
            <Popup
                isOpen={addProductPopup.isOpen}
                onClose={() => { addProductPopup.close(); resetForm(); }}
                title="Nuevo Producto"
                description="Agrega un nuevo producto al catálogo"
                onConfirm={handleCreateProduct}
                confirmText="Crear Producto"
                isLoading={isLoading}
                size="xl"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateProduct(); }}>
                    <Input
                        id="productName"
                        label="Nombre del Producto"
                        placeholder="Ej: Hamburguesa Clásica"
                        value={formData.nombre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    
                    <TextArea
                        id="productDescription"
                        label="Descripción"
                        placeholder="Descripción del producto (opcional)"
                        value={formData.descripcion}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="productPrice"
                            label="Precio"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.precio.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                            required
                        />
                        
                        <Input
                            id="productStock"
                            label="Stock Inicial"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.stock.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="productCategory" className="block text-sm font-medium text-[var(--foreground)]">
                            Categoría *
                        </label>
                        <select
                            id="productCategory"
                            value={formData.categoria_id}
                            onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--foreground)]">
                            Imagen del Producto
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="productTax" className="block text-sm font-medium text-[var(--foreground)]">
                            Tasa Impositiva *
                        </label>
                        <select
                            id="productTax"
                            value={formData.tasa_impositiva_id || ''}
                            onChange={(e) => setFormData({ ...formData, tasa_impositiva_id: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            required
                        >
                            <option value="">Selecciona una tasa</option>
                            {tasas.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre} ({t.porcentaje}%)</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Popup>

            {/* Modal para editar producto */}
            <Popup
                isOpen={editProductPopup.isOpen}
                onClose={() => { editProductPopup.close(); resetForm(); }}
                title="Editar Producto"
                description="Modifica la información del producto"
                onConfirm={handleUpdateProduct}
                confirmText="Guardar Cambios"
                isLoading={isLoading}
                size="xl"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
                    <Input
                        id="editProductName"
                        label="Nombre del Producto"
                        placeholder="Ej: Hamburguesa Clásica"
                        value={formData.nombre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    
                    <TextArea
                        id="editProductDescription"
                        label="Descripción"
                        placeholder="Descripción del producto (opcional)"
                        value={formData.descripcion}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="editProductPrice"
                            label="Precio"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.precio.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                            required
                        />
                        
                        <Input
                            id="editProductStock"
                            label="Stock"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.stock.toString()}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="editProductCategory" className="block text-sm font-medium text-[var(--foreground)]">
                            Categoría *
                        </label>
                        <select
                            id="editProductCategory"
                            value={formData.categoria_id}
                            onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--foreground)]">
                            Imagen del Producto
                        </label>
                        {formData.imagen && !imagePreview && (
                            <div className="mb-2">
                                <img 
                                    src={formData.imagen.startsWith('http') ? formData.imagen : `http://localhost:8000${formData.imagen}`}
                                    alt="Imagen actual" 
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]    dark:focus:ring-[var(--primary)]"
                        />
                        {imagePreview && (
                            <div className="mt-2 justify-center flex items-center">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="editProductTax" className="block text-sm font-medium text-[var(--foreground)]">
                            Tasa Impositiva *
                        </label>
                        <select
                            id="editProductTax"
                            value={formData.tasa_impositiva_id || ''}
                            onChange={(e) => setFormData({ ...formData, tasa_impositiva_id: e.target.value })}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            required
                        >
                            <option value="">Selecciona una tasa</option>
                            {tasas.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre} ({t.porcentaje}%)</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Popup>

            {/* Modal para actualizar stock */}
            <Popup
                isOpen={stockPopup.isOpen}
                onClose={() => { stockPopup.close(); setStockUpdate(0); }}
                title="Actualizar Stock"
                description={`Producto: ${selectedProduct?.nombre}`}
                onConfirm={handleUpdateStock}
                confirmText="Actualizar"
                isLoading={isLoading}
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        id="stockUpdate"
                        label="Nuevo Stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stockUpdate.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStockUpdate(parseInt(e.target.value) || 0)}
                        required
                    />
                    <div className="text-sm text-[var(--muted-foreground)]">
                        Stock actual: <span className="font-medium text-[var(--foreground)]">{selectedProduct?.stock || 0}</span> unidades
                    </div>
                </div>
            </Popup>

            {/* Modal de confirmación para eliminar */}
            <AlertPopup
                isOpen={deleteProductPopup.isOpen}
                onClose={deleteProductPopup.close}
                onConfirm={handleDeleteProduct}
                title="Eliminar Producto"
                message={`¿Estás seguro de que deseas eliminar "${selectedProduct?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="error"
            />

            <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
}