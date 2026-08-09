from rest_framework import viewsets, permissions
from apps.authentication.permissions import IsEmployee
from .models import CategorieStock, ArticleStock, MouvementStock
from .serializers import CategorieStockSerializer, ArticleStockSerializer, MouvementStockSerializer

class CategorieStockViewSet(viewsets.ModelViewSet):
    queryset = CategorieStock.objects.all()
    serializer_class = CategorieStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]


class ArticleStockViewSet(viewsets.ModelViewSet):
    queryset = ArticleStock.objects.all().order_by('-id')
    serializer_class = ArticleStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]


class MouvementStockViewSet(viewsets.ModelViewSet):
    queryset = MouvementStock.objects.all().order_by('-id')
    serializer_class = MouvementStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def perform_create(self, serializer):
        serializer.save(effectue_par=self.request.user)
