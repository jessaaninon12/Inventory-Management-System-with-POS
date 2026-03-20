"""
Inventory data-transfer objects used between the API, service, and infrastructure layers.
"""


class InventoryTransactionDTO:
    """Read representation of a stock transaction."""

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
        self.quantity_change = quantity_change
        self.transaction_type = transaction_type
        self.reference = reference
        self.notes = notes
        self.timestamp = timestamp

    @staticmethod
    def from_entity(entity):
        return InventoryTransactionDTO(
            id=entity.id,
            product_id=entity.product_id,
            product_name=entity.product_name,
            quantity_change=entity.quantity_change,
            transaction_type=entity.transaction_type,
            reference=entity.reference,
            notes=entity.notes,
            timestamp=entity.timestamp,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity_change": self.quantity_change,
            "transaction_type": self.transaction_type,
            "reference": self.reference,
            "notes": self.notes,
            "timestamp": str(self.timestamp) if self.timestamp else None,
        }


class InventoryItemDTO:
    """Snapshot of a product's current stock level."""

    def __init__(
        self,
        product_id=None,
        product_name="",
        current_stock=0,
        unit="piece",
        low_stock_threshold=10,
        needs_restock=False,
        is_critical=False,
        stock_percentage=0.0,
        restock_suggestion=0,
    ):
        self.product_id = product_id
        self.product_name = product_name
        self.current_stock = current_stock
        self.unit = unit
        self.low_stock_threshold = low_stock_threshold
        self.needs_restock = needs_restock
        self.is_critical = is_critical
        self.stock_percentage = stock_percentage
        self.restock_suggestion = restock_suggestion

    @staticmethod
    def from_entity(entity):
        return InventoryItemDTO(
            product_id=entity.product_id,
            product_name=entity.product_name,
            current_stock=entity.current_stock,
            unit=entity.unit,
            low_stock_threshold=entity.low_stock_threshold,
            needs_restock=entity.needs_restock,
            is_critical=entity.is_critical,
            stock_percentage=entity.stock_percentage,
            restock_suggestion=entity.restock_suggestion,
        )

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "current_stock": self.current_stock,
            "unit": self.unit,
            "low_stock_threshold": self.low_stock_threshold,
            "needs_restock": self.needs_restock,
            "is_critical": self.is_critical,
            "stock_percentage": self.stock_percentage,
            "restock_suggestion": self.restock_suggestion,
        }


class CreateTransactionDTO:
    """Payload for recording a new inventory transaction."""

    def __init__(
        self,
        product_id,
        quantity_change,
        transaction_type="adjustment",
        reference="",
        notes="",
    ):
        self.product_id = int(product_id)
        self.quantity_change = int(quantity_change)
        self.transaction_type = transaction_type
        self.reference = reference
        self.notes = notes
