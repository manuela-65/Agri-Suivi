import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from django.urls import resolve, Resolver404
from django.test import RequestFactory
from django.db import connection
from apps.tenants.models import Client, Domain

print('INSTALLED_APPS:', len(django.conf.settings.INSTALLED_APPS))
print('PUBLIC_SCHEMA_URLCONF:', django.conf.settings.PUBLIC_SCHEMA_URLCONF)
print('TENANT_MODEL:', django.conf.settings.TENANT_MODEL)

factory = RequestFactory()
req = factory.post('/api/auth/token/', content_type='application/json', data='{}')
try:
    match = resolve(req.path_info)
    print('resolve:', match)
except Resolver404 as exc:
    print('Resolver404:', exc)

print('Tenants:')
for client in Client.objects.all():
    print('-', client.schema_name, client.name)

print('Domains:')
for domain in Domain.objects.all():
    print('-', domain.domain, 'tenant=', domain.tenant.schema_name if domain.tenant else None, 'primary=', domain.is_primary)

print('Connection settings:', connection.settings_dict)
