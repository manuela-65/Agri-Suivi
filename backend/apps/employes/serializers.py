from datetime import date

from rest_framework import serializers
from .models import Employe, TacheEmploye, Pointage

class TacheEmployeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TacheEmploye
        fields = '__all__'


class EmployeSerializer(serializers.ModelSerializer):
    taches = TacheEmployeSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()
    
    # Champs virtuels pour la création/mise à jour du compte utilisateur lié
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_role = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Employe
        fields = '__all__'

    def validate_date_embauche(self, value):
        if value > date.today():
            raise serializers.ValidationError("La date ne peut pas être dans le futur.")
        return value

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"
        
    def get_user_role(self, obj):
        if obj.user:
            return obj.user.role
        return None

class PointageSerializer(serializers.ModelSerializer):
    employe_nom = serializers.SerializerMethodField()

    class Meta:
        model = Pointage
        fields = '__all__'

    def validate_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("La date ne peut pas être dans le futur.")
        return value

    def get_employe_nom(self, obj):
        return f"{obj.employe.prenom} {obj.employe.nom}"
