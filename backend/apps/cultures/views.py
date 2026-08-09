from rest_framework import viewsets, permissions
from apps.authentication.permissions import IsEmployee
from .models import Parcelle, Culture, Elevage, ActiviteAgricole
from .serializers import ParcelleSerializer, CultureSerializer, ElevageSerializer, ActiviteAgricoleSerializer

class ParcelleViewSet(viewsets.ModelViewSet):
    queryset = Parcelle.objects.all().order_by('-id')
    serializer_class = ParcelleSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]


class CultureViewSet(viewsets.ModelViewSet):
    queryset = Culture.objects.all().order_by('-id')
    serializer_class = CultureSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]


class ElevageViewSet(viewsets.ModelViewSet):
    queryset = Elevage.objects.all().order_by('-id')
    serializer_class = ElevageSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]


class ActiviteAgricoleViewSet(viewsets.ModelViewSet):
    queryset = ActiviteAgricole.objects.all().order_by('-id')
    serializer_class = ActiviteAgricoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]
