from django.db import models
from django.conf import settings

class CategorieStock(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom


class ArticleStock(models.Model):
    categorie = models.ForeignKey(CategorieStock, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    nom = models.CharField(max_length=150)
    type_article = models.CharField(
        max_length=30,
        choices=[
            ('INTRANT', 'Intrant (Engrais/Semences/Pesticides)'),
            ('RECOLTE', 'Produit Récolté'),
            ('EQUIPEMENT', 'Outillage / Équipement'),
            ('ALIMENTATION', 'Aliment pour Bétail'),
            ('AUTRE', 'Autre')
        ],
        default='INTRANT'
    )
    quantite_en_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    seuil_alerte = models.DecimalField(max_digits=12, decimal_places=2, default=10.0, help_text="Seuil minimum déclenchant l'alerte réapprovisionnement")
    unite_mesure = models.CharField(max_length=30, default="kg", help_text="ex: kg, Litres, Sacs, Unités, Tonnes")
    prix_unitaire_moyen = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, help_text="en FCFA")
    emplacement = models.CharField(max_length=100, blank=True, null=True, help_text="ex: Magasin principal, Hangar B")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} ({self.quantite_en_stock} {self.unite_mesure})"


class MouvementStock(models.Model):
    article = models.ForeignKey(ArticleStock, on_delete=models.CASCADE, related_name='mouvements')
    type_mouvement = models.CharField(
        max_length=20,
        choices=[('ENTREE', 'Entrée en stock'), ('SORTIE', 'Sortie / Utilisation'), ('PERTE', 'Perte / Avarie')],
        default='ENTREE'
    )
    quantite = models.DecimalField(max_digits=12, decimal_places=2)
    prix_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, help_text="en FCFA")
    motif = models.CharField(max_length=255, blank=True, null=True, help_text="ex: Achats d'engrais NPK, Semis du Champ Nord")
    date_mouvement = models.DateField(auto_now_add=True)
    effectue_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Mettre à jour automatiquement le stock lors de la sauvegarde
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            if self.type_mouvement == 'ENTREE':
                self.article.quantite_en_stock += self.quantite
            elif self.type_mouvement in ['SORTIE', 'PERTE']:
                self.article.quantite_en_stock -= self.quantite
            self.article.save()

            if self.article.quantite_en_stock <= self.article.seuil_alerte:
                from apps.tracabilite.models import Notification
                if self.effectue_par:
                    Notification.objects.create(
                        utilisateur=self.effectue_par,
                        titre="Stock faible",
                        message=f"Le stock de {self.article.nom} est passé sous le seuil d'alerte ({self.article.quantite_en_stock} {self.article.unite_mesure} restants).",
                        type_notif='STOCK'
                    )

    def __str__(self):
        return f"{self.get_type_mouvement_display()} : {self.quantite} {self.article.unite_mesure} de {self.article.nom}"
