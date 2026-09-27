import hashlib
from datetime import date

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

    def validate(self, attrs):
        for field in ('date_semis', 'date_recolte_prevue'):
            if attrs.get(field) and attrs[field] > date.today():
                raise serializers.ValidationError({field: "La date ne peut pas être dans le futur."})
        return attrs


class ElevageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elevage
        fields = '__all__'

    def validate_date_acquisition(self, value):
        if value > date.today():
            raise serializers.ValidationError("La date ne peut pas être dans le futur.")
        return value


class ActiviteAgricoleSerializer(serializers.ModelSerializer):
    employe_nom = serializers.SerializerMethodField()

    class Meta:
        model = ActiviteAgricole
        fields = '__all__'

    def validate_date_activite(self, value):
        if value > date.today():
            raise serializers.ValidationError("La date ne peut pas être dans le futur.")
        return value

    def validate_preuve_video(self, value):
        digest = hashlib.sha256()
        for chunk in iter(lambda: value.read(1024 * 1024), b''):
            digest.update(chunk)
        value.seek(0)
        video_hash = digest.hexdigest()

        if ActiviteAgricole.objects.filter(preuve_video_hash=video_hash).exists():
            raise serializers.ValidationError(
                "Cette vidéo est déjà associée à une autre activité. Choisissez une autre vidéo."
            )

        for activity in ActiviteAgricole.objects.exclude(preuve_video__isnull=True).exclude(preuve_video=''):
            if activity.preuve_video_hash:
                continue
            try:
                activity.preuve_video.open('rb')
                existing_digest = hashlib.sha256()
                for chunk in iter(lambda: activity.preuve_video.read(1024 * 1024), b''):
                    existing_digest.update(chunk)
                activity.preuve_video.close()
                if existing_digest.hexdigest() == video_hash:
                    raise serializers.ValidationError(
                        "Cette vidéo est déjà associée à une autre activité. Choisissez une autre vidéo."
                    )
            except FileNotFoundError:
                continue

        return value

    def get_employe_nom(self, obj):
        if obj.employe_responsable:
            return f"{obj.employe_responsable.prenom} {obj.employe_responsable.nom}"
        return None
