import uuid
from typing import Any

from sqlmodel import Session, select

from models.company.mesarestaurante import MesaRestaurante, MesaRestauranteCreate, MesaRestauranteUpdate


def create_mesa(*, session: Session, mesa_create: MesaRestauranteCreate) -> MesaRestaurante:
    """
    Crear una nueva mesa de restaurante.
    """
    db_obj = MesaRestaurante.model_validate(mesa_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_mesa(*, session: Session, db_mesa: MesaRestaurante, mesa_in: MesaRestauranteUpdate) -> MesaRestaurante:
    """
    Actualizar una mesa de restaurante existente.
    """
    mesa_data = mesa_in.model_dump(exclude_unset=True)
    db_mesa.sqlmodel_update(mesa_data)
    session.add(db_mesa)
    session.commit()
    session.refresh(db_mesa)
    return db_mesa


def get_mesa_by_id(*, session: Session, mesa_id: uuid.UUID) -> MesaRestaurante | None:
    """
    Obtener una mesa por su ID.
    """
    return session.get(MesaRestaurante, mesa_id)


def get_mesas_by_restaurante(*, session: Session, restaurante_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[MesaRestaurante]:
    """
    Obtener todas las mesas de un restaurante específico.
    """
    statement = select(MesaRestaurante).where(MesaRestaurante.restaurante_id == restaurante_id).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def get_mesa_by_numero(*, session: Session, restaurante_id: uuid.UUID, numero_mesa: int) -> MesaRestaurante | None:
    """
    Obtener una mesa por su número en un restaurante específico.
    """
    statement = select(MesaRestaurante).where(
        MesaRestaurante.restaurante_id == restaurante_id,
        MesaRestaurante.numero_mesa == numero_mesa
    )
    return session.exec(statement).first()


def asignar_orden_a_mesa(
    *, 
    session: Session, 
    mesa_id: uuid.UUID, 
    orden_id: uuid.UUID,
    numero_comensales: int
) -> MesaRestaurante | None:
    """
    Asignar una orden activa a una mesa y cambiar su estado a 'ocupada'.
    """
    mesa = session.get(MesaRestaurante, mesa_id)
    if not mesa:
        return None
    
    mesa.orden_activa_id = orden_id
    mesa.estado = "ocupada"
    mesa.numero_comensales = numero_comensales
    
    session.add(mesa)
    session.commit()
    session.refresh(mesa)
    return mesa


def liberar_mesa(*, session: Session, mesa_id: uuid.UUID) -> MesaRestaurante | None:
    """
    Liberar una mesa, eliminar la orden asociada y cambiar su estado a 'disponible'.
    """
    mesa = session.get(MesaRestaurante, mesa_id)
    if not mesa:
        return None
    
    mesa.orden_activa_id = None
    mesa.estado = "disponible"
    mesa.numero_comensales = None
    
    session.add(mesa)
    session.commit()
    session.refresh(mesa)
    return mesa


def cambiar_estado_mesa(
    *, 
    session: Session, 
    mesa_id: uuid.UUID, 
    nuevo_estado: str
) -> MesaRestaurante | None:
    """
    Cambiar el estado de una mesa.
    Estados válidos: disponible, ocupada, reservada
    """
    estados_validos = ["disponible", "ocupada", "reservada"]
    if nuevo_estado not in estados_validos:
        return None
    
    mesa = session.get(MesaRestaurante, mesa_id)
    if not mesa:
        return None
    
    mesa.estado = nuevo_estado
    
    session.add(mesa)
    session.commit()
    session.refresh(mesa)
    return mesa


def delete_mesa(*, session: Session, mesa_id: uuid.UUID) -> bool:
    """
    Eliminar una mesa de restaurante.
    Retorna True si se eliminó correctamente, False si no existía.
    """
    mesa = session.get(MesaRestaurante, mesa_id)
    if not mesa:
        return False
    session.delete(mesa)
    session.commit()
    return True
