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
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Photo de profil")
    is_active_employee = models.BooleanField(default=True, verbose_name="Statut Actif")

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
