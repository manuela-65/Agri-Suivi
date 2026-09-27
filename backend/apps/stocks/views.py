from rest_framework import viewsets, permissions
from apps.authentication.permissions import IsEmployee
from .models import CategorieStock, ArticleStock, MouvementStock
from .serializers import CategorieStockSerializer, ArticleStockSerializer, MouvementStockSerializer

class CategorieStockViewSet(viewsets.ModelViewSet):
    serializer_class = CategorieStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return CategorieStock.objects.all()


class ArticleStockViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return ArticleStock.objects.all().order_by('-id')


class MouvementStockViewSet(viewsets.ModelViewSet):
    serializer_class = MouvementStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return MouvementStock.objects.all().order_by('-id')

    def perform_create(self, serializer):
        serializer.save(effectue_par=self.request.user)
