from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.authentication.permissions import IsEmployee
from .models import Employe, TacheEmploye
from .serializers import EmployeSerializer, TacheEmployeSerializer

User = get_user_model()

class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all().order_by('-id')
    serializer_class = EmployeSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def perform_create(self, serializer):
        with transaction.atomic():
            employe = serializer.save()
            if employe.email:
                # Créer le compte utilisateur pour l'employé s'il a un email
                user, created = User.objects.get_or_create(
                    username=employe.email,
                    defaults={
                        'email': employe.email,
                        'first_name': employe.prenom,
                        'last_name': employe.nom,
                        'role': 'EMPLOYE',
                        'is_active': True,
                    }
                )
                if created:
                    # Mot de passe par défaut
                    user.set_password('employe123')
                    user.save()
                
                employe.user = user
                employe.save()

class TacheEmployeViewSet(viewsets.ModelViewSet):
    queryset = TacheEmploye.objects.all().order_by('-id')
    serializer_class = TacheEmployeSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]
