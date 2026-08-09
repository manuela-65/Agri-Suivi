import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')

django.setup()

from django.test import RequestFactory
from apps.tenants.middleware import TenantHostHeaderMiddleware
from django_tenants.middleware.main import TenantMainMiddleware
from django.http import HttpResponse

factory = RequestFactory()
request = factory.post('/api/auth/token/', data='{}', content_type='application/json', HTTP_X_TENANT_ID='tenant_7c44644f', HTTP_HOST='127.0.0.1:8000')
print('before:', request.get_host(), request.META.get('HTTP_HOST'), request.META.get('SERVER_NAME'), request.META.get('SERVER_PORT'), 'X_TENANT_ID=', request.META.get('HTTP_X_TENANT_ID'))

host_mw = TenantHostHeaderMiddleware(get_response=lambda req: HttpResponse())
host_mw.process_request(request)
print('after host mw get_host():', request.get_host())
print('after host mw HTTP_HOST:', request.META.get('HTTP_HOST'))
print('after host mw SERVER_NAME:', request.META.get('SERVER_NAME'))
print('after host mw SERVER_PORT:', request.META.get('SERVER_PORT'))
print('after host mw X_TENANT_ID:', request.META.get('HTTP_X_TENANT_ID'))

main_mw = TenantMainMiddleware(get_response=lambda req: HttpResponse())
try:
    response = main_mw.process_request(request)
    print('main middleware returned response:', response)
    print('request.tenant:', getattr(request, 'tenant', None))
    print('request.urlconf:', getattr(request, 'urlconf', None))
    if hasattr(request, 'tenant'):
        print('tenant schema:', request.tenant.schema_name)
except Exception as exc:
    print('main middleware exception:', type(exc).__name__, exc)
