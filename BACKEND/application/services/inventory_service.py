"""
Inventory application service — orchestrates stock-management business logic.
Depends only on domain entities, DTOs, and repository interfaces.
"""

from domain.entities.inventory import InventoryTransaction
from application.dtos.inventory_dto import (
    InventoryItemDTO,
    InventoryTransactionDTO,
)
from application.interfaces.inventory_repository_interface import (
    InventoryRepositoryInterface,
)
from application.interfaces.product_repository_interface import (
    ProductRepositoryInterface,
)


class InventoryService:

    def __init__(
        self,
        inventory_repository: InventoryRepositoryInterface,
        product_repository: ProductRepositoryInterface,
    ):
        self.inventory_repo = inventory_repository
        self.product_repo = product_repository

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_inventory_summary(self):
        """Return InventoryItemDTO for every product."""
        items = self.inventory_repo.get_inventory_summary()
        return [InventoryItemDTO.from_entity(i) for i in items]

    def get_low_stock_items(self):
        items = self.inventory_repo.get_low_stock_items()
        return [InventoryItemDTO.from_entity(i) for i in items]

    def get_product_history(self, product_id):
        txns = self.inventory_repo.get_transactions_by_product(product_id)
        return [InventoryTransactionDTO.from_entity(t) for t in txns]

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def adjust_stock(self, dto):
        """
        Record a stock transaction *and* update the product's stock count.

        Business rule enforcement:
        - The domain entity validates the transaction.
        - The product's stock is adjusted via its own domain method.
        """
        product = self.product_repo.get_by_id(dto.product_id)
        if product is None:
            raise ValueError(f"Product {dto.product_id} not found.")

        transaction = InventoryTransaction(
            product_id=dto.product_id,
            product_name=product.name,
            quantity_change=dto.quantity_change,
            transaction_type=dto.transaction_type,
            reference=dto.reference,
            notes=dto.notes,
        )
        errors = transaction.validate()
        if errors:
            raise ValueError(errors)

        # Apply business rule on the product entity
        product.adjust_stock(dto.quantity_change)

        # Persist both changes
        self.product_repo.update(product)
        saved = self.inventory_repo.create_transaction(transaction)
        return InventoryTransactionDTO.from_entity(saved)
