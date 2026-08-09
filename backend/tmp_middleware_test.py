import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from django.test import RequestFactory
from apps.tenants.middleware import TenantHostHeaderMiddleware
from django_tenants.middleware.main import TenantMainMiddleware
from django.conf import settings

factory = RequestFactory()
request = factory.post('/api/auth/token/', data='{}', content_type='application/json', HTTP_X_TENANT_ID='tenant_7c44644f', HTTP_HOST='127.0.0.1:8000')

print('Before middleware:')
for key in ['HTTP_HOST', 'SERVER_NAME', 'SERVER_PORT', 'HTTP_X_TENANT_ID']:
    print(key, request.META.get(key))

host_mw = TenantHostHeaderMiddleware()
host_mw.process_request(request)
print('\nAfter TenantHostHeaderMiddleware:')
for key in ['HTTP_HOST', 'SERVER_NAME', 'SERVER_PORT', 'HTTP_X_TENANT_ID', 'HTTP_X_ORIGINAL_HOST']:
    print(key, request.META.get(key))

main_mw = TenantMainMiddleware()
result = main_mw.process_request(request)
print('\nTenantMainMiddleware result:', result)
print('Tenant in request:', getattr(request, 'tenant', None))
try:
    print('Tenant schema name:', request.tenant.schema_name)
except Exception as e:
    print('Tenant access error:', e)
print('Current urlconf:', getattr(request, 'urlconf', None))
