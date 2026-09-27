import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from apps.assistant_ia.models import Conversation, Message
from apps.assistant_ia.services import AssistantService
from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

def run_test():
    user = User.objects.filter(role='PROPRIETAIRE').first()
    if not user:
        print("No PROPRIETAIRE user found.")
        return

    print(f"Testing with user: {user.email}")
    conversation = Conversation.objects.create(utilisateur=user)
    message_text = "Bonjour"
    user_message = Message.objects.create(
        conversation=conversation,
        role='user',
        content=message_text
    )
    
    history = conversation.messages.all().order_by('created_at')[:20]
    tenant_schema = connection.schema_name
    print(f"Calling get_ai_response with schema: {tenant_schema}")
    
    try:
        response = AssistantService.get_ai_response(
            user_message.content, 
            list(history),
            tenant_schema
        )
        print("Response from AI:", response)
    except Exception as e:
        print("Exception caught!")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_test()
