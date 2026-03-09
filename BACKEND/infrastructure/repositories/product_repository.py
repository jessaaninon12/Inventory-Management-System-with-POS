"""
Product repository — concrete implementation using Django ORM.
Implements the contract defined in application.interfaces.
"""

from django.db.models import F

from application.interfaces.product_repository_interface import (
    ProductRepositoryInterface,
)
from domain.entities.product import Product
from infrastructure.data.models import ProductModel


class ProductRepository(ProductRepositoryInterface):

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_all(self):
        return [self._to_entity(m) for m in ProductModel.objects.all()]

    def get_by_id(self, product_id):
        try:
            return self._to_entity(ProductModel.objects.get(pk=product_id))
        except ProductModel.DoesNotExist:
            return None

    def get_low_stock(self):
        qs = ProductModel.objects.filter(stock__lte=F("low_stock_threshold"))
        return [self._to_entity(m) for m in qs]

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def create(self, product: Product):
        m = ProductModel.objects.create(**self._to_model_data(product))
        return self._to_entity(m)

    def update(self, product: Product):
        ProductModel.objects.filter(pk=product.id).update(
            **self._to_model_data(product)
        )
        return self.get_by_id(product.id)

    def delete(self, product_id):
        deleted, _ = ProductModel.objects.filter(pk=product_id).delete()
        return deleted > 0

    # ------------------------------------------------------------------
    # Mapping helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_entity(m: ProductModel) -> Product:
        return Product(
            id=m.pk,
            name=m.name,
            category=m.category,
            price=float(m.price),
            cost=float(m.cost),
            stock=m.stock,
            unit=m.unit,
            description=m.description,
            low_stock_threshold=m.low_stock_threshold,
            image_url=m.image_url,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )

    @staticmethod
    def _to_model_data(entity: Product) -> dict:
        return {
            "name": entity.name,
            "category": entity.category,
            "price": entity.price,
            "cost": entity.cost,
            "stock": entity.stock,
            "unit": entity.unit,
            "description": entity.description,
            "low_stock_threshold": entity.low_stock_threshold,
            "image_url": entity.image_url,
        }
