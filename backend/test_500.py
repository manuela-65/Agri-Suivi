import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from apps.assistant_ia.views import ChatAPIView
from django_tenants.utils import schema_context

User = get_user_model()

def run_test():
    user = User.objects.filter(role='PROPRIETAIRE').first()
    if not user:
        print("No owner found")
        return

    factory = APIRequestFactory()
    request = factory.post('/api/assistant/chat/', {'message': 'Hello'}, format='json')
    force_authenticate(request, user=user)

    view = ChatAPIView.as_view()
    
    tenant = getattr(user, 'tenant', None)
    if not tenant:
        print("User has no tenant")
        return
        
    print(f"Using tenant: {tenant.schema_name}")
    
    with schema_context(tenant.schema_name):
        try:
            response = view(request)
            print("Response status:", response.status_code)
            print("Response data:", response.data)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    run_test()
