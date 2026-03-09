"""
Inventory API controllers — thin HTTP layer.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.schema_serializers import (
    ErrorSchema,
    InventoryItemResponseSchema,
    StockAdjustRequestSchema,
    TransactionResponseSchema,
)
from application.dtos.inventory_dto import CreateTransactionDTO
from application.services.inventory_service import InventoryService
from infrastructure.repositories.inventory_repository import InventoryRepository
from infrastructure.repositories.product_repository import ProductRepository


def _get_service():
    return InventoryService(InventoryRepository(), ProductRepository())


class InventorySummaryController(APIView):
    """GET /api/inventory/ → full inventory summary."""

    @extend_schema(tags=["Inventory"], responses=InventoryItemResponseSchema(many=True))
    def get(self, request):
        service = _get_service()
        items = service.get_inventory_summary()
        return Response([i.to_dict() for i in items])


class LowStockInventoryController(APIView):
    """GET /api/inventory/low-stock/ → items at or below threshold."""

    @extend_schema(tags=["Inventory"], responses=InventoryItemResponseSchema(many=True))
    def get(self, request):
        service = _get_service()
        items = service.get_low_stock_items()
        return Response([i.to_dict() for i in items])


class StockAdjustController(APIView):
    """POST /api/inventory/adjust/ → record a stock adjustment."""

    @extend_schema(
        tags=["Inventory"],
        request=StockAdjustRequestSchema,
        responses={201: TransactionResponseSchema, 400: ErrorSchema},
    )
    def post(self, request):
        service = _get_service()
        try:
            dto = CreateTransactionDTO(
                product_id=request.data.get("product_id"),
                quantity_change=request.data.get("quantity_change", 0),
                transaction_type=request.data.get("transaction_type", "adjustment"),
                reference=request.data.get("reference", ""),
                notes=request.data.get("notes", ""),
            )
            txn = service.adjust_stock(dto)
            return Response(txn.to_dict(), status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(
                {"errors": e.args[0] if isinstance(e.args[0], list) else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProductHistoryController(APIView):
    """GET /api/inventory/<product_id>/history/ → transaction log."""

    @extend_schema(tags=["Inventory"], responses=TransactionResponseSchema(many=True))
    def get(self, request, product_id):
        service = _get_service()
        history = service.get_product_history(product_id)
        return Response([t.to_dict() for t in history])
