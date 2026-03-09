"""
Order API controllers — thin HTTP layer.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.schema_serializers import (
    CreateOrderRequestSchema,
    ErrorSchema,
    OrderResponseSchema,
    UpdateOrderRequestSchema,
)
from application.dtos.order_dto import CreateOrderDTO, UpdateOrderDTO
from application.services.order_service import OrderService
from infrastructure.repositories.order_repository import OrderRepository


def _get_service():
    return OrderService(OrderRepository())


class OrderListCreateController(APIView):
    """
    GET  /api/orders/      → list all orders
    POST /api/orders/      → create a new order
    """

    @extend_schema(tags=["Orders"], responses=OrderResponseSchema(many=True))
    def get(self, request):
        service = _get_service()
        orders = service.get_all_orders()
        return Response([o.to_dict() for o in orders])

    @extend_schema(
        tags=["Orders"],
        request=CreateOrderRequestSchema,
        responses={201: OrderResponseSchema, 400: ErrorSchema},
    )
    def post(self, request):
        service = _get_service()
        try:
            dto = CreateOrderDTO(
                order_id=request.data.get("order_id", ""),
                customer_name=request.data.get("customer_name", ""),
                date=request.data.get("date"),
                status=request.data.get("status", "Pending"),
                items=request.data.get("items", []),
            )
            order = service.create_order(dto)
            return Response(order.to_dict(), status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(
                {"errors": e.args[0]}, status=status.HTTP_400_BAD_REQUEST
            )


class OrderDetailController(APIView):
    """
    GET    /api/orders/<pk>/  → retrieve
    PUT    /api/orders/<pk>/  → update
    DELETE /api/orders/<pk>/  → delete
    """

    @extend_schema(tags=["Orders"], responses={200: OrderResponseSchema, 404: ErrorSchema})
    def get(self, request, pk):
        service = _get_service()
        order = service.get_order(pk)
        if order is None:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(order.to_dict())

    @extend_schema(
        tags=["Orders"],
        request=UpdateOrderRequestSchema,
        responses={200: OrderResponseSchema, 400: ErrorSchema, 404: ErrorSchema},
    )
    def put(self, request, pk):
        service = _get_service()
        try:
            dto = UpdateOrderDTO(**request.data)
            order = service.update_order(pk, dto)
            if order is None:
                return Response(
                    {"error": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(order.to_dict())
        except ValueError as e:
            return Response(
                {"errors": e.args[0]}, status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(tags=["Orders"], responses={204: None, 404: ErrorSchema})
    def delete(self, request, pk):
        service = _get_service()
        deleted = service.delete_order(pk)
        if not deleted:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderCancelController(APIView):
    """POST /api/orders/<pk>/cancel/ → cancel an order."""

    @extend_schema(tags=["Orders"], request=None, responses={200: OrderResponseSchema, 400: ErrorSchema, 404: ErrorSchema})
    def post(self, request, pk):
        service = _get_service()
        try:
            order = service.cancel_order(pk)
            if order is None:
                return Response(
                    {"error": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(order.to_dict())
        except ValueError as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )


class OrderCompleteController(APIView):
    """POST /api/orders/<pk>/complete/ → mark an order as completed."""

    @extend_schema(tags=["Orders"], request=None, responses={200: OrderResponseSchema, 400: ErrorSchema, 404: ErrorSchema})
    def post(self, request, pk):
        service = _get_service()
        try:
            order = service.complete_order(pk)
            if order is None:
                return Response(
                    {"error": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(order.to_dict())
        except ValueError as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
