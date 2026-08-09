from rest_framework import permissions
from .models import CustomUser

class IsPlatformAdmin(permissions.BasePermission):
    """
    Permission accordée uniquement aux administrateurs de la plateforme SaaS.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == CustomUser.Role.ADMIN_PLATFORME
        )


class IsOwner(permissions.BasePermission):
    """
    Permission accordée aux propriétaires d'exploitation (Administrateur Tenant).
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == CustomUser.Role.PROPRIETAIRE or request.user.is_superuser)
        )


class IsAccountant(permissions.BasePermission):
    """
    Permission accordée aux comptables et aux propriétaires.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [CustomUser.Role.COMPTABLE, CustomUser.Role.PROPRIETAIRE]
        )


class IsEmployee(permissions.BasePermission):
    """
    Permission accordée à tous les employés, comptables et propriétaires de l'exploitation.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [CustomUser.Role.EMPLOYE, CustomUser.Role.COMPTABLE, CustomUser.Role.PROPRIETAIRE]
        )
