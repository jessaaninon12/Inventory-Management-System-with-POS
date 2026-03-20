"""
Inventory domain entities — pure business logic, no framework dependencies.
"""

from datetime import datetime


class InventoryTransaction:
    """Represents a single stock movement (in, out, adjustment, return)."""

    TRANSACTION_TYPES = ["stock_in", "stock_out", "adjustment", "return"]

    def __init__(
        self,
        id=None,
        product_id=None,
        product_name="",
        quantity_change=0,
        transaction_type="adjustment",
        reference="",
        notes="",
        timestamp=None,
    ):
        self.id = id
        self.product_id = product_id
        self.product_name = product_name
        self.quantity_change = int(quantity_change)
        self.transaction_type = transaction_type
        self.reference = reference
        self.notes = notes
        self.timestamp = timestamp or datetime.now()

    @property
    def is_inbound(self):
        return self.quantity_change > 0

    def validate(self):
        errors = []
        if self.product_id is None:
            errors.append("Product ID is required.")
        if self.quantity_change == 0:
            errors.append("Quantity change cannot be zero.")
        if self.transaction_type not in self.TRANSACTION_TYPES:
            errors.append(f"Invalid transaction type: {self.transaction_type}")
        return errors

    def __str__(self):
        sign = "+" if self.is_inbound else ""
        return f"{self.product_name}: {sign}{self.quantity_change}"

    def __repr__(self):
        return (
            f"InventoryTransaction(product={self.product_id}, "
            f"change={self.quantity_change})"
        )


class InventoryItem:
    """Read-only snapshot of a product's current inventory status."""

    def __init__(
        self,
        product_id=None,
        product_name="",
        current_stock=0,
        unit="piece",
        low_stock_threshold=10,
    ):
        self.product_id = product_id
        self.product_name = product_name
        self.current_stock = int(current_stock)
        self.unit = unit
        self.low_stock_threshold = int(low_stock_threshold)

    @property
    def needs_restock(self):
        return self.current_stock <= self.low_stock_threshold

    @property
    def is_critical(self):
        if self.low_stock_threshold <= 0:
            return self.current_stock <= 0
        return self.current_stock <= self.low_stock_threshold / 2

    @property
    def stock_percentage(self):
        if self.low_stock_threshold <= 0:
            return 100.0
        return round((self.current_stock / self.low_stock_threshold) * 100, 1)

    @property
    def restock_suggestion(self):
        """Units needed to reach the reorder threshold."""
        if not self.needs_restock:
            return 0
        return self.low_stock_threshold - self.current_stock

    def __str__(self):
        return f"{self.product_name}: {self.current_stock} {self.unit}"

    def __repr__(self):
        return (
            f"InventoryItem(product={self.product_name}, "
            f"stock={self.current_stock})"
        )
