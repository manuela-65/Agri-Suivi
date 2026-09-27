from django.urls import path
from .views import RegisterTenantView, ClientListView, PlatformStatisticsView, ClientStatusUpdateView, GlobalNotificationView

urlpatterns = [
    path('register/', RegisterTenantView.as_view(), name='tenant-register'),
    path('list/', ClientListView.as_view(), name='tenant-list'),
    path('stats/', PlatformStatisticsView.as_view(), name='tenant-stats'),
    path('<int:pk>/status/', ClientStatusUpdateView.as_view(), name='tenant-status-update'),
    path('notify/', GlobalNotificationView.as_view(), name='tenant-notify'),
]
