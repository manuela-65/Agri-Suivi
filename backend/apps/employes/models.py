from django.db import models
from django.conf import settings

class Employe(models.Model):
    """
    Modèle d'employé de l'exploitation agricole.
    Peut être associé ou non à un compte utilisateur système (CustomUser).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='employe_profile'
    )
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    poste = models.CharField(max_length=100, help_text="ex: Chef de culture, Ouvrier agricole, Tractoriste")
    telephone = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    salaire_mensuel = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    date_embauche = models.DateField()
    statut = models.CharField(
        max_length=20,
        choices=[('ACTIF', 'Actif'), ('INACTIF', 'Inactif'), ('CONGE', 'En Congé')],
        default='ACTIF'
    )
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.poste}"


class TacheEmploye(models.Model):
    """
    Tâche affectée à un employé avec suivi de statut.
    """
    employe = models.ForeignKey(Employe, on_delete=models.CASCADE, related_name='taches')
    titre = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    priorite = models.CharField(
        max_length=20,
        choices=[('BASSE', 'Basse'), ('MOYENNE', 'Moyenne'), ('HAUTE', 'Haute'), ('URGENTE', 'Urgente')],
        default='MOYENNE'
    )
    statut = models.CharField(
        max_length=20,
        choices=[('A_FAIRE', 'À Faire'), ('EN_COURS', 'En Cours'), ('TERMINE', 'Terminé'), ('ANNULE', 'Annulé')],
        default='A_FAIRE'
    )
    date_debut = models.DateField()
    date_echeance = models.DateField()
    cree_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.titre} ({self.get_statut_display()})"
