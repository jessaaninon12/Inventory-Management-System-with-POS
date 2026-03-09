"""
Inventory repository interface — defines the contract that infrastructure must implement.
"""

from abc import ABC, abstractmethod


class InventoryRepositoryInterface(ABC):

    @abstractmethod
    def get_transactions_by_product(self, product_id):
        """Return all InventoryTransaction entities for a given product."""
        pass

    @abstractmethod
    def create_transaction(self, transaction):
        """Persist a new InventoryTransaction and return the saved entity."""
        pass

    @abstractmethod
    def get_low_stock_items(self):
        """Return a list of InventoryItem snapshots for products at/below threshold."""
        pass

    @abstractmethod
    def get_inventory_summary(self):
        """Return a list of InventoryItem snapshots for every product."""
        pass
