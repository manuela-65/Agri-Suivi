from rest_framework import generics, permissions
from apps.authentication.permissions import IsEmployee
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogListView(generics.ListAPIView):
    """
    Vue de consultation de l'historique et de la traçabilité des opérations.
    """
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]
