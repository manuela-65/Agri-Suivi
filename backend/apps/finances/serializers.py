from datetime import date

from rest_framework import serializers
from .models import CategorieTransaction, Transaction

class CategorieTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorieTransaction
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.ReadOnlyField(source='categorie.nom')
    cree_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'

    def validate_date_transaction(self, value):
        if value > date.today():
            raise serializers.ValidationError("La date ne peut pas être dans le futur.")
        return value

    def get_cree_par_nom(self, obj):
        if obj.cree_par:
            return obj.cree_par.get_full_name() or obj.cree_par.username
        return None
