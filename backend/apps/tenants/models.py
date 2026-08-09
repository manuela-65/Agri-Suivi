from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Client(TenantMixin):
    """
    Modèle du Tenant (Exploitation Agricole SaaS) héritant de TenantMixin.
    Chaque instance génère un schéma PostgreSQL dédié (ex: tenant_bastos).
    """
    name = models.CharField(max_length=100, verbose_name="Nom de l'exploitation")
    owner_name = models.CharField(max_length=150, verbose_name="Nom du propriétaire")
    owner_email = models.EmailField(verbose_name="Email du propriétaire")
    phone = models.CharField(max_length=30, blank=True, null=True, verbose_name="Téléphone")
    region = models.CharField(max_length=100, default="Centre", verbose_name="Région (Cameroun)")
    is_active = models.BooleanField(default=True, verbose_name="Statut Actif")
    created_on = models.DateField(auto_now_add=True)

    # Automanaged schema creation by django-tenants
    auto_create_schema = True

    def __str__(self):
        return f"{self.name} ({self.schema_name})"


class Domain(DomainMixin):
    """
    Modèle de Domaine rattaché à un Tenant (ex: ferme1.agrisuivi.cm ou localhost).
    """
    pass
