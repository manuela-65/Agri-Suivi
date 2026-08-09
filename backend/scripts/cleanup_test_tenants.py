import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from apps.tenants.models import Client, Domain
from django.db import connection

TEST_SCHEMAS = ['test_debug_01', 'test_debug_02']

for schema in TEST_SCHEMAS:
    try:
        tenant = Client.objects.filter(schema_name=schema).first()
        if tenant:
            print(f"Deleting tenant record and domains for {schema}")
            Domain.objects.filter(tenant=tenant).delete()
            tenant.delete()
        else:
            print(f"No Client record for {schema}")

        with connection.cursor() as cur:
            cur.execute(f"DROP SCHEMA IF EXISTS {schema} CASCADE;")
            print(f"Dropped schema {schema} (if existed)")
    except Exception as e:
        print('Error cleaning', schema, e)

print('Cleanup complete')
