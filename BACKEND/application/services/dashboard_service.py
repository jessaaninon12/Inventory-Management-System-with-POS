"""
Dashboard application service — orchestrates dashboard data aggregation.
Depends only on DTOs and the repository interface.
"""

from datetime import datetime

from application.dtos.dashboard_dto import DashboardDTO
from application.interfaces.dashboard_repository_interface import (
    DashboardRepositoryInterface,
)


class DashboardService:

    def __init__(self, repository: DashboardRepositoryInterface):
        self.repository = repository

    def get_dashboard(self):
        """Build and return a complete DashboardDTO."""
        total_sales = self.repository.get_total_sales()
        total_sales_returns = self.repository.get_total_sales_returns()
        total_products = self.repository.get_total_products_count()
        total_expenses = self.repository.get_total_expenses()
        profit = total_sales - total_expenses
        orders_today = self.repository.get_total_orders_today()

        current_year = datetime.now().year
        monthly_sales = self.repository.get_monthly_sales(current_year)
        top_selling = self.repository.get_top_selling_products(limit=5)
        low_stock = self.repository.get_low_stock_products(limit=5)
        recent_sales = self.repository.get_recent_sales(limit=5)

        return DashboardDTO(
            total_sales=total_sales,
            total_sales_returns=total_sales_returns,
            total_products=total_products,
            profit=profit,
            total_expenses=total_expenses,
            total_payment_returns=total_sales_returns,
            orders_today=orders_today,
            monthly_sales=monthly_sales,
            top_selling=top_selling,
            low_stock_products=low_stock,
            recent_sales=recent_sales,
        )
