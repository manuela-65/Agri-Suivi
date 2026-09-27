from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.cache import cache
from django_tenants.utils import schema_context
import random
from .models import CustomUser
from .permissions import IsOwner
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    RegisterUserSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    VerifyPhoneOTPSerializer,
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        username = (request.data.get('username') or request.data.get('email') or '').strip()
        password = request.data.get('password') or ''

        if username and password:
            # Recherche directe dans le schéma public (CustomUser est un modèle SHARED).
            # On NE scan plus tous les tenants — ce qui était le bug principal d'isolation.
            user = CustomUser.objects.filter(email__iexact=username).first()

            if user and user.check_password(password) and user.is_active:
                tenant_schema = user.tenant_schema

                # Fallback pour les utilisateurs existants sans tenant_schema renseigné.
                # On tente de le retrouver via l'email du propriétaire dans la table Client.
                if not tenant_schema:
                    from apps.tenants.models import Client
                    client = Client.objects.filter(
                        owner_email__iexact=username
                    ).exclude(schema_name='public').first()
                    if client:
                        tenant_schema = client.schema_name
                        # On persiste pour les prochains logins
                        user.tenant_schema = tenant_schema
                        user.save(update_fields=['tenant_schema'])

                tenant_schema = tenant_schema or 'public'
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'tenant_schema': tenant_schema,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': user.role,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'phone': user.phone,
                    },
                })

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.data['tenant_schema'] = 'public'
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'refresh': ['Ce champ est requis.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Déconnexion réussie.'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as exc:
            return Response({'detail': 'Token invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterEmployeeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            role = serializer.validated_data.get('role') or CustomUser.Role.EMPLOYE
            if role == CustomUser.Role.ADMIN_PLATFORME:
                return Response(
                    {'detail': "Impossible de créer un administrateur de la plateforme depuis ce endpoint."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user = serializer.save(role=role)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': ['Mot de passe actuel incorrect.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Mot de passe modifié avec succès.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserManagementViewSet(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = CustomUser.objects.get(email=email)
                token = str(random.randint(100000, 999999))
                cache.set(f"pwd_reset_{email}", token, timeout=3600)
                print(f"\n[EMAIL SIMULATION] Réinitialisation de mot de passe pour {email}:")
                print(f"Code / Token: {token}\n")
                return Response({'detail': 'Email de réinitialisation envoyé (voir console).'})
            except CustomUser.DoesNotExist:
                return Response({'detail': 'Email de réinitialisation envoyé (voir console).'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            cached_token = cache.get(f"pwd_reset_{email}")
            if cached_token and cached_token == token:
                try:
                    user = CustomUser.objects.get(email=email)
                    user.set_password(new_password)
                    user.save()
                    cache.delete(f"pwd_reset_{email}")
                    return Response({'detail': 'Mot de passe réinitialisé avec succès.'})
                except CustomUser.DoesNotExist:
                    return Response({'detail': 'Utilisateur introuvable.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'token': ['Code invalide ou expiré.']}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendPhoneOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.phone:
            return Response({'detail': 'Aucun numéro de téléphone défini.'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        cache.set(f"phone_otp_{user.id}", otp, timeout=300)
        print(f"\n[SMS SIMULATION] Envoi OTP à {user.phone}:")
        print(f"Code: {otp}\n")
        return Response({'detail': 'OTP envoyé par SMS (voir console).'})


class VerifyPhoneOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VerifyPhoneOTPSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            otp = serializer.validated_data['otp']
            cached_otp = cache.get(f"phone_otp_{user.id}")
            if cached_otp and cached_otp == otp:
                user.is_phone_verified = True
                user.save()
                cache.delete(f"phone_otp_{user.id}")
                return Response({'detail': 'Numéro de téléphone vérifié avec succès.'})
            return Response({'otp': ['Code invalide ou expiré.']}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
