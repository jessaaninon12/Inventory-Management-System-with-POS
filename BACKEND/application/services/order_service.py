"""
Order application service — orchestrates business logic.
Depends only on domain entities, DTOs, and the repository interface.
"""

from domain.entities.order import Order, OrderItem
from application.dtos.order_dto import OrderDTO
from application.interfaces.order_repository_interface import (
    OrderRepositoryInterface,
)


class OrderService:

    def __init__(self, repository: OrderRepositoryInterface):
        self.repository = repository

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_all_orders(self):
        entities = self.repository.get_all()
        return [OrderDTO.from_entity(e) for e in entities]

    def get_order(self, pk):
        entity = self.repository.get_by_id(pk)
        if entity is None:
            return None
        return OrderDTO.from_entity(entity)

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def create_order(self, dto):
        """Build an Order entity from the DTO, validate, and persist."""
        items = [
            OrderItem(
                product_id=i.get("product_id"),
                product_name=i.get("product_name", ""),
                quantity=i.get("quantity", 1),
                unit_price=i.get("unit_price", 0),
            )
            for i in dto.items
        ]
        entity = Order(
            order_id=dto.order_id,
            customer_name=dto.customer_name,
            date=dto.date,
            status=dto.status,
            items=items,
        )
        errors = entity.validate()
        if errors:
            raise ValueError(errors)
        saved = self.repository.create(entity)
        return OrderDTO.from_entity(saved)

    def update_order(self, pk, dto):
        entity = self.repository.get_by_id(pk)
        if entity is None:
            return None

        if dto.customer_name is not None:
            entity.customer_name = dto.customer_name
        if dto.status is not None:
            entity.status = dto.status
        if dto.date is not None:
            entity.date = dto.date

        saved = self.repository.update(entity)
        return OrderDTO.from_entity(saved)

    def cancel_order(self, pk):
        """Apply business rule: only pending orders can be cancelled."""
        entity = self.repository.get_by_id(pk)
        if entity is None:
            return None
        entity.cancel()  # raises ValueError if not allowed
        saved = self.repository.update(entity)
        return OrderDTO.from_entity(saved)

    def complete_order(self, pk):
        """Apply business rule: only pending orders can be completed."""
        entity = self.repository.get_by_id(pk)
        if entity is None:
            return None
        entity.complete()
        saved = self.repository.update(entity)
        return OrderDTO.from_entity(saved)

    def delete_order(self, pk):
        return self.repository.delete(pk)
