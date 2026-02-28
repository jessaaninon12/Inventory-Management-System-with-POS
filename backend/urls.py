from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, SaleViewSet, UserAccountViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'users', UserAccountViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
