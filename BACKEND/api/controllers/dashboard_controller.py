"""
Dashboard API controller — thin HTTP layer.
Aggregates all dashboard data into a single response.
"""

from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from api.schema_serializers import DashboardResponseSchema
from application.services.dashboard_service import DashboardService
from infrastructure.repositories.dashboard_repository import DashboardRepository


def _get_service():
    return DashboardService(DashboardRepository())


class DashboardController(APIView):
    """
    GET  /api/dashboard/  → aggregated dashboard data
    """

    @extend_schema(tags=["Dashboard"], responses=DashboardResponseSchema)
    def get(self, request):
        service = _get_service()
        dashboard = service.get_dashboard()
        return Response(dashboard.to_dict())
