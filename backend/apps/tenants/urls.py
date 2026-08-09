from django.urls import path
from .views import RegisterTenantView, ClientListView

urlpatterns = [
    path('register/', RegisterTenantView.as_view(), name='tenant-register'),
    path('list/', ClientListView.as_view(), name='tenant-list'),
]
