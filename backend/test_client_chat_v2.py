import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from apps.assistant_ia.views import ChatAPIView
from django_tenants.utils import get_tenant_model, tenant_context
from rest_framework.test import force_authenticate

User = get_user_model()
TenantModel = get_tenant_model()

def run():
    tenant = TenantModel.objects.exclude(schema_name='public').first()
    if not tenant:
        print("No tenant")
        return
        
    with tenant_context(tenant):
        user = User.objects.filter(role='PROPRIETAIRE').first()
        if not user:
            print("No owner")
            return
            
        factory = RequestFactory()
        request = factory.post('/api/assistant/chat/', {'message': 'Hello'}, content_type='application/json')
        force_authenticate(request, user=user)
        
        request.tenant = tenant
        
        view = ChatAPIView.as_view()
        try:
            res = view(request)
            print("Status:", res.status_code)
            if res.status_code == 500:
                print("500 Error:", res.data)
            else:
                print("Success:", res.data)
        except Exception as e:
            print("Exception:")
            import traceback
            traceback.print_exc()

run()
