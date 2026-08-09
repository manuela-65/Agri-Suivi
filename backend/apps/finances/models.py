from django.db import models
from django.conf import settings

class CategorieTransaction(models.Model):
    nom = models.CharField(max_length=100)
    type_categorie = models.CharField(
        max_length=20,
        choices=[('RECETTE', 'Recette'), ('DEPENSE', 'Dépense')],
        default='DEPENSE'
    )
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} ({self.get_type_categorie_display()})"


class Transaction(models.Model):
    categorie = models.ForeignKey(CategorieTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    type_transaction = models.CharField(
        max_length=20,
        choices=[
            ('VENTE', 'Vente'),
            ('ACHAT', 'Achat'),
            ('DEPENSE', 'Dépense'),
            ('REVENU', 'Revenu'),
        ],
        default='VENTE'
    )
    montant = models.DecimalField(max_digits=14, decimal_places=2, help_text="Montant en FCFA")
    description = models.CharField(max_length=255, help_text="ex: Vente de 50 sacs de maïs à Grossiste Yaoundé")
    date_transaction = models.DateField()
    mode_paiement = models.CharField(
        max_length=50,
        choices=[
            ('CASH', 'Espèces'),
            ('MOBILE_MONEY', 'Mobile Money (MTN/Orange)'),
            ('VIREMENT', 'Virement Bancaire'),
            ('CHEQUE', 'Chèque')
        ],
        default='CASH'
    )
    reference_recu = models.CharField(max_length=100, blank=True, null=True, help_text="N° de recu ou référence Mobile Money")
    cree_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_type_transaction_display()} - {self.montant} FCFA ({self.date_transaction})"
