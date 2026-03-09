"""
Dashboard repository — concrete implementation using Django ORM.
Provides aggregation queries for dashboard summary data.
"""

from datetime import date

from django.db.models import F, Sum, Value
from django.db.models.functions import Coalesce, ExtractMonth

from application.interfaces.dashboard_repository_interface import (
    DashboardRepositoryInterface,
)
from infrastructure.data.models import OrderItemModel, OrderModel, ProductModel


class DashboardRepository(DashboardRepositoryInterface):

    # ------------------------------------------------------------------
    # Summary cards
    # ------------------------------------------------------------------

    def get_total_sales(self):
        """Sum of (quantity * unit_price) across all completed orders."""
        result = (
            OrderItemModel.objects
            .filter(order__status="Completed")
            .aggregate(
                total=Coalesce(
                    Sum(F("quantity") * F("unit_price")),
                    Value(0.0),
                )
            )
        )
        return float(result["total"])

    def get_total_sales_returns(self):
        """Sum of (quantity * unit_price) across all cancelled orders."""
        result = (
            OrderItemModel.objects
            .filter(order__status="Cancelled")
            .aggregate(
                total=Coalesce(
                    Sum(F("quantity") * F("unit_price")),
                    Value(0.0),
                )
            )
        )
        return float(result["total"])

    def get_total_products_count(self):
        return ProductModel.objects.count()

    def get_profit(self):
        """Revenue minus cost for completed orders."""
        revenue = self.get_total_sales()
        expenses = self.get_total_expenses()
        return revenue - expenses

    def get_total_expenses(self):
        """Sum of (quantity * product.cost) for completed order items."""
        result = (
            OrderItemModel.objects
            .filter(order__status="Completed", product__isnull=False)
            .aggregate(
                total=Coalesce(
                    Sum(F("quantity") * F("product__cost")),
                    Value(0.0),
                )
            )
        )
        return float(result["total"])

    def get_total_orders_today(self):
        today = date.today()
        return OrderModel.objects.filter(date__date=today).count()

    # ------------------------------------------------------------------
    # Charts
    # ------------------------------------------------------------------

    def get_monthly_sales(self, year):
        """Return a list of 12 floats — one per month — for the given year."""
        qs = (
            OrderItemModel.objects
            .filter(order__status="Completed", order__date__year=year)
            .annotate(month=ExtractMonth("order__date"))
            .values("month")
            .annotate(
                total=Coalesce(
                    Sum(F("quantity") * F("unit_price")),
                    Value(0.0),
                )
            )
            .order_by("month")
        )
        monthly = [0.0] * 12
        for row in qs:
            monthly[row["month"] - 1] = float(row["total"])
        return monthly

    # ------------------------------------------------------------------
    # Lists
    # ------------------------------------------------------------------

    def get_top_selling_products(self, limit=5):
        qs = (
            OrderItemModel.objects
            .filter(order__status="Completed")
            .values("product_name")
            .annotate(
                total_quantity=Coalesce(Sum("quantity"), Value(0)),
                total_revenue=Coalesce(
                    Sum(F("quantity") * F("unit_price")),
                    Value(0.0),
                ),
            )
            .order_by("-total_revenue")[:limit]
        )
        return [
            {
                "product_name": row["product_name"],
                "total_quantity": row["total_quantity"],
                "total_revenue": str(round(float(row["total_revenue"]), 2)),
            }
            for row in qs
        ]

    def get_low_stock_products(self, limit=5):
        qs = (
            ProductModel.objects
            .filter(stock__lte=F("low_stock_threshold"))
            .order_by("stock")[:limit]
        )
        return [
            {
                "id": p.pk,
                "name": p.name,
                "stock": p.stock,
                "image_url": p.image_url or "",
            }
            for p in qs
        ]

    def get_recent_sales(self, limit=5):
        qs = (
            OrderModel.objects
            .prefetch_related("items")
            .order_by("-date")[:limit]
        )
        results = []
        for order in qs:
            total = sum(
                float(item.unit_price) * item.quantity
                for item in order.items.all()
            )
            first_item = order.items.first()
            results.append({
                "id": order.pk,
                "order_id": order.order_id,
                "customer_name": order.customer_name,
                "product_name": first_item.product_name if first_item else "",
                "category": "",
                "total": str(round(total, 2)),
                "status": order.status,
                "date": str(order.date) if order.date else None,
                "image_url": "",
            })
        return results
