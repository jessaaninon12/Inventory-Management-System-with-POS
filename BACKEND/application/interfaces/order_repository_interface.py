"""
Order repository interface — defines the contract that infrastructure must implement.
"""

from abc import ABC, abstractmethod


class OrderRepositoryInterface(ABC):

    @abstractmethod
    def get_all(self):
        """Return a list of all Order domain entities."""
        pass

    @abstractmethod
    def get_by_id(self, pk):
        """Return a single Order entity by primary key, or None."""
        pass

    @abstractmethod
    def get_by_order_id(self, order_id_str):
        """Return a single Order entity by its human-readable order_id string."""
        pass

    @abstractmethod
    def create(self, order):
        """Persist a new Order (with items) and return the saved entity."""
        pass

    @abstractmethod
    def update(self, order):
        """Update an existing Order and return the saved entity."""
        pass

    @abstractmethod
    def delete(self, pk):
        """Delete an Order by primary key. Return True on success."""
        pass
