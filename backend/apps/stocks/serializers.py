from rest_framework import serializers
from .models import CategorieStock, ArticleStock, MouvementStock

class CategorieStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorieStock
        fields = '__all__'


class ArticleStockSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.ReadOnlyField(source='categorie.nom')
    est_en_alerte = serializers.SerializerMethodField()

    class Meta:
        model = ArticleStock
        fields = '__all__'

    def get_est_en_alerte(self, obj):
        return obj.quantite_en_stock <= obj.seuil_alerte


class MouvementStockSerializer(serializers.ModelSerializer):
    article_nom = serializers.ReadOnlyField(source='article.nom')
    unite_mesure = serializers.ReadOnlyField(source='article.unite_mesure')

    class Meta:
        model = MouvementStock
        fields = '__all__'
