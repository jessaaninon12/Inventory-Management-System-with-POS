"""
Order repository — concrete implementation using Django ORM.
"""

from application.interfaces.order_repository_interface import (
    OrderRepositoryInterface,
)
from domain.entities.order import Order, OrderItem
from infrastructure.data.models import OrderModel, OrderItemModel


class OrderRepository(OrderRepositoryInterface):

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_all(self):
        qs = OrderModel.objects.prefetch_related("items").all()
        return [self._to_entity(m) for m in qs]

    def get_by_id(self, pk):
        try:
            m = OrderModel.objects.prefetch_related("items").get(pk=pk)
            return self._to_entity(m)
        except OrderModel.DoesNotExist:
            return None

    def get_by_order_id(self, order_id_str):
        try:
            m = OrderModel.objects.prefetch_related("items").get(
                order_id=order_id_str
            )
            return self._to_entity(m)
        except OrderModel.DoesNotExist:
            return None

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def create(self, order: Order):
        m = OrderModel.objects.create(
            order_id=order.order_id,
            customer_name=order.customer_name,
            date=order.date,
            status=order.status,
        )
        for item in order.items:
            OrderItemModel.objects.create(
                order=m,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
        return self.get_by_id(m.pk)

    def update(self, order: Order):
        OrderModel.objects.filter(pk=order.id).update(
            customer_name=order.customer_name,
            status=order.status,
            date=order.date,
        )
        return self.get_by_id(order.id)

    def delete(self, pk):
        deleted, _ = OrderModel.objects.filter(pk=pk).delete()
        return deleted > 0

    # ------------------------------------------------------------------
    # Mapping
    # ------------------------------------------------------------------

    @staticmethod
    def _to_entity(m: OrderModel) -> Order:
        items = [
            OrderItem(
                id=i.pk,
                order_id=m.pk,
                product_id=i.product_id,
                product_name=i.product_name,
                quantity=i.quantity,
                unit_price=float(i.unit_price),
            )
            for i in m.items.all()
        ]
        return Order(
            id=m.pk,
            order_id=m.order_id,
            customer_name=m.customer_name,
            date=m.date,
            status=m.status,
            items=items,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
