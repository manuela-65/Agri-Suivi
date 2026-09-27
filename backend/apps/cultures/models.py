import hashlib

from django.db import models
from apps.employes.models import Employe

class Parcelle(models.Model):
    nom = models.CharField(max_length=100, help_text="ex: Parcelle Nord, Champ A")
    superficie = models.DecimalField(max_digits=8, decimal_places=2, help_text="Superficie en Hectares")
    type_sol = models.CharField(max_length=100, blank=True, null=True, help_text="ex: Argileux, Ferralitique")
    localisation = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return f"{self.nom} ({self.superficie} Ha)"


class Culture(models.Model):
    parcelle = models.ForeignKey(Parcelle, on_delete=models.CASCADE, related_name='cultures')
    variete = models.CharField(max_length=100, help_text="ex: Maïs hybride, Cacao Trinitario, Bananier Plantain")
    type_culture = models.CharField(
        max_length=30,
        choices=[('VIVRIERE', 'Culture Vivrière'), ('RENTE', 'Culture de Rente'), ('MARAICHERE', 'Culture Maraîchère')],
        default='VIVRIERE'
    )
    date_semis = models.DateField()
    date_recolte_prevue = models.DateField(blank=True, null=True)
    quantite_semee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, help_text="en kg ou Plants")
    rendement_estime = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, help_text="en Tonnes ou kg")
    statut = models.CharField(
        max_length=30,
        choices=[('EN_CROISSANCE', 'En Croissance'), ('RECOLTE_EN_COURS', 'Récolte en Cours'), ('TERMINEE', 'Terminée'), ('PERDUE', 'Perdue')],
        default='EN_CROISSANCE'
    )
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.variete} - {self.parcelle.nom}"


class Elevage(models.Model):
    type_animaux = models.CharField(max_length=100, help_text="ex: Poulets de chair, Porcs, Pondeuses, Bovins")
    nombre_tetes = models.IntegerField(default=0)
    date_acquisition = models.DateField()
    batiment = models.CharField(max_length=100, blank=True, null=True, help_text="ex: Poulailler 1, Enclos B")
    statut_sanitaire = models.CharField(max_length=100, default="Bon", help_text="Vaccinations à jour, Traitement en cours")
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.type_animaux} ({self.nombre_tetes} têtes)"


class ActiviteAgricole(models.Model):
    """
    Rapport/Suivi quotidien des activités de terrain (Labourage, Semis, Traitement Phytosanitaire, Récolte).
    """
    culture = models.ForeignKey(Culture, on_delete=models.CASCADE, null=True, blank=True, related_name='activites')
    elevage = models.ForeignKey(Elevage, on_delete=models.CASCADE, null=True, blank=True, related_name='activites')
    employe_responsable = models.ForeignKey(Employe, on_delete=models.SET_NULL, null=True, blank=True)
    type_activite = models.CharField(max_length=100, help_text="ex: Désherbage, Engrais, Vaccination, Alimentation")
    date_activite = models.DateField()
    description = models.TextField()
    cout_associe = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, help_text="en FCFA")
    preuve_video = models.FileField(upload_to='activites/videos/', blank=True, null=True, help_text="Vidéo de preuve de l'activité")
    preuve_video_hash = models.CharField(max_length=64, blank=True, null=True, editable=False, db_index=True)

    def save(self, *args, **kwargs):
        if self.preuve_video and not self.preuve_video_hash:
            digest = hashlib.sha256()
            self.preuve_video.open('rb')
            for chunk in iter(lambda: self.preuve_video.read(1024 * 1024), b''):
                digest.update(chunk)
            self.preuve_video.seek(0)
            self.preuve_video_hash = digest.hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type_activite} du {self.date_activite}"
