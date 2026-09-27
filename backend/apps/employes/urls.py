from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeViewSet, TacheEmployeViewSet, PointageViewSet

router = DefaultRouter()
router.register(r'list', EmployeViewSet, basename='employes')
router.register(r'taches', TacheEmployeViewSet, basename='taches')
router.register(r'pointages', PointageViewSet, basename='pointages')
urlpatterns = [
    path('', include(router.urls)),
]
