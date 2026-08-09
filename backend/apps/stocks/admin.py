from django.contrib import admin
from .models import CategorieStock, ArticleStock, MouvementStock

@admin.register(CategorieStock)
class CategorieStockAdmin(admin.ModelAdmin):
    list_display = ('nom', 'description')

@admin.register(ArticleStock)
class ArticleStockAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_article', 'quantite_en_stock', 'unite_mesure', 'seuil_alerte', 'emplacement')
    list_filter = ('type_article', 'categorie')
    search_fields = ('nom',)

@admin.register(MouvementStock)
class MouvementStockAdmin(admin.ModelAdmin):
    list_display = ('article', 'type_mouvement', 'quantite', 'prix_total', 'date_mouvement', 'effectue_par')
    list_filter = ('type_mouvement', 'date_mouvement')
