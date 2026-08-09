import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from django.test import RequestFactory
from apps.tenants.middleware import TenantHostHeaderMiddleware, CustomTenantMainMiddleware
from django.http import HttpResponse

schema = 'tenant_7c44644f'
request_factory = RequestFactory()
request = request_factory.post('/api/auth/token/', data='{}', content_type='application/json', HTTP_X_TENANT_ID=schema, HTTP_HOST='127.0.0.1:8000')
print('initial schema=', schema)
print('initial HTTP_X_TENANT_ID=', request.META.get('HTTP_X_TENANT_ID'))
print('initial HTTP_HOST=', request.META.get('HTTP_HOST'))

host_mw = TenantHostHeaderMiddleware(get_response=lambda req: HttpResponse())
host_mw.process_request(request)
print('after header HTTP_X_TENANT_ID=', request.META.get('HTTP_X_TENANT_ID'))
print('after header HTTP_HOST=', request.META.get('HTTP_HOST'))

main_mw = CustomTenantMainMiddleware(get_response=lambda req: HttpResponse())
try:
    main_mw.process_request(request)
    print('after main request.tenant=', getattr(request, 'tenant', None))
    if hasattr(request, 'tenant'):
        print('tenant schema=', request.tenant.schema_name)
        print('tenant name=', request.tenant.name)
        print('tenant id=', request.tenant.id)
except Exception as exc:
    print('main middleware exception:', type(exc).__name__, exc)
