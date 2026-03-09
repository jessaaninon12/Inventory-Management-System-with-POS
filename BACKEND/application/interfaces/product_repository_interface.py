"""
Product repository interface — defines the contract that infrastructure must implement.
"""

from abc import ABC, abstractmethod


class ProductRepositoryInterface(ABC):

    @abstractmethod
    def get_all(self):
        """Return a list of all Product domain entities."""
        pass

    @abstractmethod
    def get_by_id(self, product_id):
        """Return a single Product entity or None."""
        pass

    @abstractmethod
    def create(self, product):
        """Persist a new Product and return the saved entity."""
        pass

    @abstractmethod
    def update(self, product):
        """Update an existing Product and return the saved entity."""
        pass

    @abstractmethod
    def delete(self, product_id):
        """Delete a Product by its primary key. Return True on success."""
        pass

    @abstractmethod
    def get_low_stock(self):
        """Return products whose stock <= low_stock_threshold."""
        pass
