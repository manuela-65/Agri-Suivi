from django.contrib import admin
from .models import CategorieTransaction, Transaction

@admin.register(CategorieTransaction)
class CategorieTransactionAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_categorie')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'type_transaction', 'montant', 'date_transaction', 'mode_paiement', 'reference_recu')
    list_filter = ('type_transaction', 'mode_paiement', 'date_transaction')
    search_fields = ('description', 'reference_recu')
