"""
Order domain entities — pure business logic, no framework dependencies.
"""

from datetime import datetime


class OrderItem:
    """Represents a single line-item within an order."""

    def __init__(
        self,
        id=None,
        order_id=None,
        product_id=None,
        product_name="",
        quantity=1,
        unit_price=0.0,
    ):
        self.id = id
        self.order_id = order_id
        self.product_id = product_id
        self.product_name = product_name
        self.quantity = int(quantity)
        self.unit_price = float(unit_price)

    @property
    def subtotal(self):
        return round(self.quantity * self.unit_price, 2)

    def validate(self):
        errors = []
        if self.product_id is None:
            errors.append("Product ID is required for an order item.")
        if self.quantity <= 0:
            errors.append("Quantity must be greater than zero.")
        if self.unit_price < 0:
            errors.append("Unit price cannot be negative.")
        return errors

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    def __repr__(self):
        return f"OrderItem(product={self.product_name}, qty={self.quantity})"


class Order:
    """Represents a customer order / sale transaction."""

    STATUS_CHOICES = ["Completed", "Pending", "Cancelled"]

    def __init__(
        self,
        id=None,
        order_id="",
        customer_name="",
        date=None,
        status="Pending",
        items=None,
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.order_id = order_id
        self.customer_name = customer_name
        self.date = date or datetime.now()
        self.status = status
        self.items = items or []
        self.created_at = created_at
        self.updated_at = updated_at

    # ------------------------------------------------------------------
    # Computed properties
    # ------------------------------------------------------------------

    @property
    def total(self):
        return round(sum(item.subtotal for item in self.items), 2)

    @property
    def items_count(self):
        return len(self.items)

    # ------------------------------------------------------------------
    # Business rules
    # ------------------------------------------------------------------

    def can_cancel(self):
        return self.status == "Pending"

    def can_refund(self):
        return self.status == "Completed"

    def cancel(self):
        if not self.can_cancel():
            raise ValueError("Only pending orders can be cancelled.")
        self.status = "Cancelled"

    def complete(self):
        if self.status != "Pending":
            raise ValueError("Only pending orders can be completed.")
        self.status = "Completed"

    def refund(self):
        if not self.can_refund():
            raise ValueError("Only completed orders can be refunded.")
        self.status = "Cancelled"

    def add_item(self, item: OrderItem):
        self.items.append(item)

    def validate(self):
        errors = []
        if not self.order_id:
            errors.append("Order ID is required.")
        if not self.customer_name:
            errors.append("Customer name is required.")
        if self.status not in self.STATUS_CHOICES:
            errors.append(f"Invalid status: {self.status}")
        if not self.items:
            errors.append("Order must have at least one item.")
        for item in self.items:
            errors.extend(item.validate())
        return errors

    def __str__(self):
        return f"{self.order_id} — {self.customer_name}"

    def __repr__(self):
        return f"Order(id={self.order_id}, status={self.status})"
