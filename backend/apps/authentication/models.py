from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        PROPRIETAIRE = 'PROPRIETAIRE', 'Propriétaire'
        EMPLOYE = 'EMPLOYE', 'Employé'
        COMPTABLE = 'COMPTABLE', 'Comptable'
        ADMIN_PLATFORME = 'ADMIN_PLATFORME', 'Administrateur de la plateforme'

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.EMPLOYE,
        verbose_name="Rôle dans l'exploitation"
    )
    phone = models.CharField(max_length=30, blank=True, null=True, verbose_name="Téléphone")
    is_phone_verified = models.BooleanField(default=False, verbose_name="Téléphone vérifié")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Photo de profil")
    is_active_employee = models.BooleanField(default=True, verbose_name="Statut Actif")

    # Champ d'isolation multi-tenant :
    # Chaque utilisateur (propriétaire ou employé) est rattaché à UN SEUL schéma tenant.
    # Ce champ est rempli à la création et évite le scan coûteux de tous les tenants au login.
    tenant_schema = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Schéma du tenant (exploitation)"
    )

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
