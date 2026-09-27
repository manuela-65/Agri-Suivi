from rest_framework import serializers
from .models import Client, Domain
from apps.authentication.models import CustomUser

class ClientSerializer(serializers.ModelSerializer):
    domain_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['id', 'name', 'schema_name', 'owner_name', 'owner_email', 'phone', 'region', 'is_active', 'created_on', 'domain_name']

    def get_domain_name(self, obj):
        domain = Domain.objects.filter(tenant=obj, is_primary=True).first()
        return domain.domain if domain else None


class RegisterTenantSerializer(serializers.Serializer):
    farm_name = serializers.CharField(max_length=100)
    schema_name = serializers.SlugField(max_length=50)
    owner_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    region = serializers.CharField(max_length=100, default="Centre")
    type_exploitation = serializers.ChoiceField(
        choices=[
            ('CULTURES', 'Cultures'),
            ('ELEVAGE', 'Élevage'),
            ('MIXTE', 'Cultures et Élevage'),
        ],
        default='CULTURES',
    )

    def validate_schema_name(self, value):
        normalized = value.lower().replace('-', '_')
        if Client.objects.filter(schema_name=normalized).exists():
            raise serializers.ValidationError("Ce nom de schéma est déjà utilisé.")
        return normalized

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse e-mail est déjà utilisée.")
        return value
