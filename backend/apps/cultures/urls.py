from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParcelleViewSet, CultureViewSet, ElevageViewSet, ActiviteAgricoleViewSet

router = DefaultRouter()
router.register(r'parcelles', ParcelleViewSet, basename='parcelles')
router.register(r'list', CultureViewSet, basename='cultures')
router.register(r'elevages', ElevageViewSet, basename='elevages')
router.register(r'activites', ActiviteAgricoleViewSet, basename='activites')

urlpatterns = [
    path('', include(router.urls)),
]
