import uuid
from typing import Any

from sqlmodel import Session, select

from models.bill.articulofactura import ArticuloFactura, ArticuloFacturaCreate, ArticuloFacturaUpdate


def calcular_totales_articulo(
    cantidad: int,
    precio_unitario: float,
    descuento: float,
    impuesto: float
) -> tuple[float, float]:
    """
    Calcular subtotal y total de un artículo.
    Retorna (subtotal, total)
    
    subtotal = (cantidad * precio_unitario) - descuento
    total = subtotal + impuesto
    """
    subtotal = (cantidad * precio_unitario) - descuento
    total = subtotal + impuesto
    return subtotal, total


def create_articulo_factura(*, session: Session, articulo_create: ArticuloFacturaCreate) -> ArticuloFactura:
    """
    Crear un nuevo artículo de factura.
    Calcula automáticamente subtotal y total basándose en cantidad, precio, descuento e impuesto.
    """
    # Calcular totales automáticamente
    subtotal, total = calcular_totales_articulo(
        cantidad=articulo_create.cantidad,
        precio_unitario=articulo_create.precio_unitario,
        descuento=articulo_create.descuento,
        impuesto=articulo_create.impuesto
    )
    
    # Crear artículo con los totales calculados
    articulo_data = articulo_create.model_dump()
    articulo_data['subtotal'] = subtotal
    articulo_data['total'] = total
    
    db_obj = ArticuloFactura.model_validate(articulo_data)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    
    # Actualizar totales de la factura asociada
    from app.routes.bill.factura.crud import calcular_totales_factura
    calcular_totales_factura(session=session, factura_id=db_obj.factura_id)
    
    return db_obj


def update_articulo_factura(
    *, 
    session: Session, 
    db_articulo: ArticuloFactura, 
    articulo_in: ArticuloFacturaUpdate
) -> ArticuloFactura:
    """
    Actualizar un artículo de factura existente.
    Recalcula subtotal y total si se modifican cantidad, precio, descuento o impuesto.
    """
    articulo_data = articulo_in.model_dump(exclude_unset=True)
    
    # Determinar si necesitamos recalcular totales
    recalcular = any(key in articulo_data for key in ['cantidad', 'precio_unitario', 'descuento', 'impuesto'])
    
    if recalcular:
        # Usar valores actualizados o mantener los existentes
        cantidad = articulo_data.get('cantidad', db_articulo.cantidad)
        precio_unitario = articulo_data.get('precio_unitario', db_articulo.precio_unitario)
        descuento = articulo_data.get('descuento', db_articulo.descuento)
        impuesto = articulo_data.get('impuesto', db_articulo.impuesto)
        
        # Recalcular totales
        subtotal, total = calcular_totales_articulo(cantidad, precio_unitario, descuento, impuesto)
        articulo_data['subtotal'] = subtotal
        articulo_data['total'] = total
    
    db_articulo.sqlmodel_update(articulo_data)
    session.add(db_articulo)
    session.commit()
    session.refresh(db_articulo)
    
    # Actualizar totales de la factura asociada
    from app.routes.bill.factura.crud import calcular_totales_factura
    calcular_totales_factura(session=session, factura_id=db_articulo.factura_id)
    
    return db_articulo


def get_articulo_factura_by_id(*, session: Session, articulo_id: uuid.UUID) -> ArticuloFactura | None:
    """
    Obtener un artículo de factura por su ID.
    """
    return session.get(ArticuloFactura, articulo_id)


def get_articulos_by_factura(*, session: Session, factura_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[ArticuloFactura]:
    """
    Obtener todos los artículos de una factura con paginación.
    """
    statement = select(ArticuloFactura).where(
        ArticuloFactura.factura_id == factura_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_articulos_by_producto(*, session: Session, producto_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[ArticuloFactura]:
    """
    Obtener todos los artículos por producto (historial de ventas del producto).
    """
    statement = select(ArticuloFactura).where(
        ArticuloFactura.producto_id == producto_id
    ).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_all_articulos_factura(*, session: Session, skip: int = 0, limit: int = 100) -> list[ArticuloFactura]:
    """
    Obtener todos los artículos de factura con paginación.
    """
    statement = select(ArticuloFactura).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_total_articulos_factura(*, session: Session, factura_id: uuid.UUID) -> float:
    """
    Sumar el total de todos los artículos de una factura.
    """
    statement = select(ArticuloFactura).where(ArticuloFactura.factura_id == factura_id)
    articulos = session.exec(statement).all()
    return sum(articulo.total for articulo in articulos)


def delete_articulo_factura(*, session: Session, articulo_id: uuid.UUID) -> bool:
    """
    Eliminar un artículo de factura.
    Actualiza los totales de la factura asociada después de eliminar.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    articulo = session.get(ArticuloFactura, articulo_id)
    if not articulo:
        return False
    
    factura_id = articulo.factura_id
    
    session.delete(articulo)
    session.commit()
    
    # Actualizar totales de la factura
    from app.routes.bill.factura.crud import calcular_totales_factura
    calcular_totales_factura(session=session, factura_id=factura_id)
    
    return True
