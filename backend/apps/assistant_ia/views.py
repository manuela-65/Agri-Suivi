from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import connection

from .models import Conversation, Message
from .serializers import ConversationSerializer
from .services import AssistantService


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # 1. Vérification du rôle
        if getattr(request.user, 'role', '') != 'PROPRIETAIRE':
            return Response(
                {
                    "error": "Seul le propriétaire de l'exploitation peut utiliser l'Assistant IA."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Récupération des données
        message_text = request.data.get('message')
        conversation_id = request.data.get('conversation_id')

        if not message_text:
            return Response(
                {"error": "Le message est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Vérification du schéma tenant actuel
        tenant_schema = connection.schema_name

        print("===== ASSISTANT IA =====")
        print("SCHEMA ACTUEL :", connection.schema_name)
        print("TENANT_SCHEMA :", tenant_schema)
        print("UTILISATEUR :", request.user)
        print("========================")

        # 4. Récupérer ou créer la conversation
        if conversation_id:
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    utilisateur=request.user
                )
            except Conversation.DoesNotExist:
                return Response(
                    {"error": "Conversation non trouvée."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            conversation = Conversation.objects.create(
                utilisateur=request.user
            )

        # 5. Enregistrer le message utilisateur
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=message_text
        )

        # 6. Récupérer l'historique
        history = conversation.messages.all().order_by('created_at')[:20]

        # 7. Appeler le service IA
        ai_response_text = AssistantService.get_ai_response(
            user_message.content,
            list(history),
            tenant_schema
        )

        # 8. Enregistrer la réponse de l'IA
        Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response_text
        )

        # 9. Mettre à jour la conversation
        conversation.save()

        return Response({
            "success": True,
            "message": ai_response_text,
            "conversation_id": conversation.id
        })


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if getattr(request.user, 'role', '') != 'PROPRIETAIRE':
            return Response(
                status=status.HTTP_403_FORBIDDEN
            )

        conversations = Conversation.objects.filter(
            utilisateur=request.user
        ).order_by('-updated_at')

        serializer = ConversationSerializer(
            conversations,
            many=True
        )

        return Response(serializer.data)