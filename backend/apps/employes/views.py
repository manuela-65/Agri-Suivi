from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from django.db import transaction, connection as db_connection
from apps.authentication.permissions import IsEmployee
from .models import Employe, TacheEmploye, Pointage
from .serializers import EmployeSerializer, TacheEmployeSerializer, PointageSerializer

User = get_user_model()

class EmployeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        # Évalué dynamiquement à chaque requête, dans le contexte du bon schéma tenant.
        return Employe.objects.all().order_by('-id')

    def perform_create(self, serializer):
        # On extrait les champs virtuels avant de sauvegarder
        password = serializer.validated_data.pop('password', None)
        role = serializer.validated_data.pop('role', 'EMPLOYE')

        # Le schéma courant est celui du tenant authentifié (défini par le middleware).
        current_schema = db_connection.schema_name

        with transaction.atomic():
            employe = serializer.save()
            if employe.email:
                user, created = User.objects.get_or_create(
                    username=employe.email,
                    defaults={
                        'email': employe.email,
                        'first_name': employe.prenom,
                        'last_name': employe.nom,
                        'role': role,
                        'is_active': True,
                        # Rattacher l'employé à son schéma tenant pour l'isolation au login.
                        'tenant_schema': current_schema,
                    }
                )
                if created:
                    user.set_password(password if password else 'employe123')
                    user.save()
                elif not user.tenant_schema:
                    # Mettre à jour les utilisateurs existants sans tenant_schema
                    user.tenant_schema = current_schema
                    user.save(update_fields=['tenant_schema'])

                employe.user = user
                employe.save()

    def perform_update(self, serializer):
        password = serializer.validated_data.pop('password', None)
        role = serializer.validated_data.pop('role', None)
        current_schema = db_connection.schema_name

        with transaction.atomic():
            employe = serializer.save()

            # Synchronisation avec CustomUser
            if employe.user:
                user = employe.user

                # Mise à jour des infos de base si l'email a changé (optionnel, selon règles métiers)
                if employe.email and user.email != employe.email:
                    user.email = employe.email
                    user.username = employe.email

                user.first_name = employe.prenom
                user.last_name = employe.nom

                if role:
                    user.role = role

                if password:
                    user.set_password(password)

                # Garantir que le tenant_schema est toujours renseigné
                if not user.tenant_schema:
                    user.tenant_schema = current_schema

                # Si l'employé est désactivé, désactiver le compte
                user.is_active = (employe.statut != 'INACTIF')

                user.save()

            elif employe.email:
                # Si aucun compte n'existait mais qu'on a ajouté un email, on crée le compte
                role = role or 'EMPLOYE'
                user, created = User.objects.get_or_create(
                    username=employe.email,
                    defaults={
                        'email': employe.email,
                        'first_name': employe.prenom,
                        'last_name': employe.nom,
                        'role': role,
                        'is_active': (employe.statut != 'INACTIF'),
                        'tenant_schema': current_schema,
                    }
                )
                if created:
                    user.set_password(password if password else 'employe123')
                    user.save()
                employe.user = user
                employe.save()

    def perform_destroy(self, instance):
        with transaction.atomic():
            if instance.user:
                # Désactiver l'utilisateur au lieu de le supprimer pour conserver l'historique
                user = instance.user
                user.is_active = False
                user.save()
            instance.delete()

class TacheEmployeViewSet(viewsets.ModelViewSet):
    serializer_class = TacheEmployeSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return TacheEmploye.objects.all().order_by('-id')


class PointageViewSet(viewsets.ModelViewSet):
    serializer_class = PointageSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return Pointage.objects.all().order_by('-date')
