from rest_framework import views, status, generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.management import call_command
from django_tenants.utils import schema_context
from .models import Client, Domain
from .serializers import ClientSerializer, RegisterTenantSerializer
from apps.authentication.models import CustomUser
from apps.exploitations.models import ParametresExploitation
from apps.authentication.permissions import IsPlatformAdmin

class RegisterTenantView(views.APIView):
    """
    Point de terminaison d'inscription d'une nouvelle exploitation agricole multi-locataire.
    1. Crée le client locataire dans le schéma public.
    2. Crée le domaine rattaché.
    3. Crée le compte utilisateur propriétaire dans le schéma du locataire.
    4. Initialise les paramètres de l'exploitation dans le schéma du locataire.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterTenantSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            schema_name = data['schema_name'].lower().replace('-', '_')

            if Client.objects.filter(schema_name=schema_name).exists():
                return Response(
                    {"error": f"L'identifiant d'exploitation '{schema_name}' est déjà utilisé."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Création du Tenant dans le schéma public
            tenant = Client.objects.create(
                name=data['farm_name'],
                schema_name=schema_name,
                owner_name=data['owner_name'],
                owner_email=data['email'],
                phone=data.get('phone', ''),
                region=data.get('region', 'Centre')
            )

            # Domaine tenant associé pour le développement local
            domain_name = f"{schema_name.replace('_', '-')}.localhost"
            Domain.objects.create(
                domain=domain_name,
                tenant=tenant,
                is_primary=True
            )

            # Permet de résoudre les anciens enregistrements avec underscore
            if '_' in schema_name:
                alternate_domain_name = f"{schema_name}.localhost"
                Domain.objects.create(
                    domain=alternate_domain_name,
                    tenant=tenant,
                    is_primary=False
                )

            # Initialisation du schéma tenant avant création des données métier.
            try:
                call_command(
                    'migrate_schemas',
                    '--tenant',
                    '--schema', schema_name,
                    verbosity=0,
                    interactive=False,
                    noinput=True,
                )
            except Exception as exc:
                return Response(
                    {
                        'error': 'Impossible de préparer le schéma du tenant.',
                        'details': str(exc),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Création du compte propriétaire dans le schéma PUBLIC (CustomUser est un modèle SHARED).
            # On renseigne tenant_schema pour que le login retrouve le bon schéma sans scanner tous les tenants.
            user = CustomUser.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data['owner_name'],
                role=CustomUser.Role.PROPRIETAIRE,
                phone=data.get('phone', ''),
                tenant_schema=schema_name,
            )

            # Initialisation des paramètres de l'exploitation dans le schéma tenant (modèle TENANT-spécifique).
            with schema_context(schema_name):
                ParametresExploitation.objects.create(
                    nom=data['farm_name'],
                    type_exploitation=data.get('type_exploitation', 'CULTURES'),
                    adresse='',
                    ville='N/A',
                    devise='FCFA',
                    couleur_primaire='#2e7d32',
                    couleur_secondaire='#81c784',
                    superficie_totale=0.0,
                    description='Exploitations agricole créée automatiquement.',
                )

            return Response({
                "message": "Exploitation agricole créée avec succès !",
                "tenant": {
                    "id": tenant.id,
                    "name": tenant.name,
                    "schema_name": tenant.schema_name,
                    "domain": domain_name
                },
                "user": {
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClientListView(generics.ListAPIView):
    """
    Liste les exploitations. L'administrateur voit tout, le propriétaire voit les siennes.
    """
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == CustomUser.Role.ADMIN_PLATFORME or user.is_superuser:
            return Client.objects.exclude(schema_name='public')
        # Le propriétaire de l'exploitation s'inscrit avec son email
        return Client.objects.filter(owner_email=user.email).exclude(schema_name='public')


class PlatformStatisticsView(views.APIView):
    """
    Statistiques globales pour le super administrateur (UC10)
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        total_farms = Client.objects.exclude(schema_name='public').count()
        active_farms = Client.objects.exclude(schema_name='public').filter(is_active=True).count()
        suspended_farms = Client.objects.exclude(schema_name='public').filter(is_active=False).count()
        
        return Response({
            'total_farms': total_farms,
            'active_farms': active_farms,
            'suspended_farms': suspended_farms,
        })


class ClientStatusUpdateView(views.APIView):
    """
    Suspendre ou réactiver une exploitation (UC8 & UC9)
    Seul l'admin de la plateforme peut le faire.
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]

    def patch(self, request, pk):
        try:
            client = Client.objects.exclude(schema_name='public').get(pk=pk)
        except Client.DoesNotExist:
            return Response({'error': 'Exploitation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({'error': 'Le champ is_active est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        client.is_active = bool(is_active)
        client.save()

        status_text = "réactivée" if client.is_active else "suspendue"
        return Response({
            'message': f"L'exploitation '{client.name}' a été {status_text} avec succès.",
            'is_active': client.is_active
        })

class GlobalNotificationView(views.APIView):
    """
    Envoi d'une annonce ou mise à jour globale (UC12)
    Pour l'instant, c'est un mock qui log l'annonce dans la console du backend.
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        message = request.data.get('message')
        if not message:
            return Response({'error': 'Le message est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        # Simulation d'envoi à tous les locataires
        print(f"\n[NOTIF GLOBALE] De l'admin {request.user.email} à tous les tenants :")
        print(f"Message : {message}\n")

        return Response({'message': 'La notification a été envoyée avec succès à tous les locataires.'}, status=status.HTTP_200_OK)
