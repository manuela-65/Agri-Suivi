from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategorieTransactionViewSet, TransactionViewSet, BilanFinancierView

router = DefaultRouter()
router.register(r'categories', CategorieTransactionViewSet, basename='categories-finance')
router.register(r'list', TransactionViewSet, basename='transactions')

urlpatterns = [
    path('bilan/', BilanFinancierView.as_view(), name='bilan-financier'),
    path('', include(router.urls)),
]
