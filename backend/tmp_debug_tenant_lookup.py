import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from apps.tenants.models import Client

schema = 'tenant_7c44644f'
try:
    tenant = Client.objects.get(schema_name=schema)
    print('found tenant:', tenant, tenant.schema_name, tenant.name)
except Exception as exc:
    print('error', type(exc).__name__, exc)

print('public tenant:', Client.objects.get(schema_name='public'))
print('tenant count all:', Client.objects.count())
