from django.urls import path
from .views import DashboardStatsView, GenererRapportView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('generer/', GenererRapportView.as_view(), name='rapport-generer'),
]
