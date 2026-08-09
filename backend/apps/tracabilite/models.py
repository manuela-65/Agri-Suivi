from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    """
    Journal de traçabilité immutable enregistré au sein du schéma tenant.
    Trace l'auteur, le type d'action, le module concerné, l'adresse IP et la date exacte.
    """
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    nom_utilisateur = models.CharField(max_length=150, blank=True, null=True)
    role_utilisateur = models.CharField(max_length=50, blank=True, null=True)
    type_action = models.CharField(
        max_length=20,
        choices=[
            ('CREATION', 'Création'),
            ('MODIFICATION', 'Modification'),
            ('SUPPRESSION', 'Suppression'),
            ('CONNEXION', 'Connexion'),
            ('EXPORT', 'Exportation / Rapport')
        ],
        default='CREATION'
    )
    module = models.CharField(max_length=100, help_text="ex: Stocks, Cultures, Employés, Finances")
    description = models.TextField(help_text="Détail lisible de l'opération effectuée")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {self.nom_utilisateur} - {self.type_action} ({self.module})"
