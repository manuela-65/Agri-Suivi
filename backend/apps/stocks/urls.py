from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategorieStockViewSet, ArticleStockViewSet, MouvementStockViewSet

router = DefaultRouter()
router.register(r'categories', CategorieStockViewSet, basename='categories-stock')
router.register(r'articles', ArticleStockViewSet, basename='articles-stock')
router.register(r'mouvements', MouvementStockViewSet, basename='mouvements-stock')

urlpatterns = [
    path('', include(router.urls)),
]
