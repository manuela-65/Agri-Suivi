from rest_framework import serializers
from .models import Parcelle, Culture, Elevage, ActiviteAgricole

class ParcelleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcelle
        fields = '__all__'


class CultureSerializer(serializers.ModelSerializer):
    parcelle_nom = serializers.ReadOnlyField(source='parcelle.nom')

    class Meta:
        model = Culture
        fields = '__all__'


class ElevageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elevage
        fields = '__all__'


class ActiviteAgricoleSerializer(serializers.ModelSerializer):
    employe_nom = serializers.SerializerMethodField()

    class Meta:
        model = ActiviteAgricole
        fields = '__all__'

    def get_employe_nom(self, obj):
        if obj.employe_responsable:
            return f"{obj.employe_responsable.prenom} {obj.employe_responsable.nom}"
        return None
