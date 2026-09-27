from django.urls import path
from .views import AuditLogListView, NotificationViewSet, MarkNotificationReadView

urlpatterns = [
    path('logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('notifications/', NotificationViewSet.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
]
