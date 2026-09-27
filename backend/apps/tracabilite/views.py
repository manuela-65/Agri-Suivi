from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.authentication.permissions import IsEmployee
from .models import AuditLog, Notification
from .serializers import AuditLogSerializer, NotificationSerializer

class AuditLogListView(generics.ListAPIView):
    """
    Vue de consultation de l'historique et de la traçabilité des opérations.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return AuditLog.objects.all().order_by('-created_at')

class NotificationViewSet(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user).order_by('-created_at')

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, utilisateur=request.user)
            notif.est_lu = True
            notif.save()
            return Response({"status": "ok"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
