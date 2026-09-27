from rest_framework import viewsets, permissions
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
import logging
from django.conf import settings
from apps.authentication.permissions import IsEmployee
from apps.tracabilite.models import AuditLog
from .models import Parcelle, Culture, Elevage, ActiviteAgricole
from .serializers import ParcelleSerializer, CultureSerializer, ElevageSerializer, ActiviteAgricoleSerializer

logger = logging.getLogger(__name__)

class ParcelleViewSet(viewsets.ModelViewSet):
    serializer_class = ParcelleSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return Parcelle.objects.all().order_by('-id')


class CultureViewSet(viewsets.ModelViewSet):
    serializer_class = CultureSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return Culture.objects.all().order_by('-id')


class ElevageViewSet(viewsets.ModelViewSet):
    serializer_class = ElevageSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return Elevage.objects.all().order_by('-id')


class ActiviteAgricoleViewSet(viewsets.ModelViewSet):
    serializer_class = ActiviteAgricoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ActiviteAgricole.objects.all().order_by('-id')

    def _create_audit_log(self, instance, action_type='CREATION'):
        if not self.request.user or not self.request.user.is_authenticated:
            return

        try:
            video_url = None
            if instance.preuve_video:
                try:
                    video_url = f"{settings.MEDIA_URL}{instance.preuve_video.name}"
                except Exception:
                    video_url = None

            AuditLog.objects.create(
                utilisateur=self.request.user,
                nom_utilisateur=self.request.user.get_full_name() or self.request.user.username,
                role_utilisateur=getattr(self.request.user, 'role', 'N/A'),
                type_action=action_type,
                module='Activites',
                description=(
                    f"{self.request.user.get_full_name() or self.request.user.username} "
                    f"a enregistré une activité de terrain{' avec une preuve vidéo.' if video_url else '.'}"
                ),
                video_url=video_url,
                ip_address=self.request.META.get('HTTP_X_FORWARDED_FOR') or self.request.META.get('REMOTE_ADDR')
            )
        except Exception as exc:
            logger.warning("Audit log creation failed for activity: %s", exc, exc_info=True)

    def perform_create(self, serializer):
        instance = serializer.save()
        self._create_audit_log(instance, 'CREATION')

    def perform_update(self, serializer):
        instance = serializer.save()
        self._create_audit_log(instance, 'MODIFICATION')
