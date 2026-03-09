"""
Order data-transfer objects used between the API, service, and infrastructure layers.
"""


class OrderItemDTO:
    """Single line-item within an order response."""

    def __init__(
        self,
        id=None,
        product_id=None,
        product_name="",
        quantity=1,
        unit_price=0.0,
        subtotal=0.0,
    ):
        self.id = id
        self.product_id = product_id
        self.product_name = product_name
        self.quantity = quantity
        self.unit_price = unit_price
        self.subtotal = subtotal

    @staticmethod
    def from_entity(entity):
        return OrderItemDTO(
            id=entity.id,
            product_id=entity.product_id,
            product_name=entity.product_name,
            quantity=entity.quantity,
            unit_price=entity.unit_price,
            subtotal=entity.subtotal,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": str(self.unit_price),
            "subtotal": str(self.subtotal),
        }


class OrderDTO:
    """Full representation of an order — used for read responses."""

    def __init__(
        self,
        id=None,
        order_id="",
        customer_name="",
        date=None,
        total=0.0,
        status="Pending",
        items_count=0,
        items=None,
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.order_id = order_id
        self.customer_name = customer_name
        self.date = date
        self.total = total
        self.status = status
        self.items_count = items_count
        self.items = items or []
        self.created_at = created_at
        self.updated_at = updated_at

    @staticmethod
    def from_entity(entity):
        return OrderDTO(
            id=entity.id,
            order_id=entity.order_id,
            customer_name=entity.customer_name,
            date=entity.date,
            total=entity.total,
            status=entity.status,
            items_count=entity.items_count,
            items=[OrderItemDTO.from_entity(i) for i in entity.items],
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "customer_name": self.customer_name,
            "date": str(self.date) if self.date else None,
            "total": str(self.total),
            "status": self.status,
            "items_count": self.items_count,
            "items": [i.to_dict() for i in self.items],
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None,
        }


class CreateOrderDTO:
    """Payload for creating a new order."""

    def __init__(self, order_id, customer_name, date, status="Pending", items=None):
        self.order_id = order_id
        self.customer_name = customer_name
        self.date = date
        self.status = status
        self.items = items or []  # list of dicts: {product_id, quantity, unit_price}


class UpdateOrderDTO:
    """Payload for updating an existing order."""

    def __init__(self, **kwargs):
        self.customer_name = kwargs.get("customer_name")
        self.status = kwargs.get("status")
        self.date = kwargs.get("date")
