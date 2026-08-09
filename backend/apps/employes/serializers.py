from rest_framework import serializers
from .models import Employe, TacheEmploye

class TacheEmployeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TacheEmploye
        fields = '__all__'


class EmployeSerializer(serializers.ModelSerializer):
    taches = TacheEmployeSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employe
        fields = '__all__'

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"
