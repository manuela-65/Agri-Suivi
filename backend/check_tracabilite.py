import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from apps.tenants.models import Client
from apps.tracabilite.models import AuditLog
from django.db import connection

for c in Client.objects.exclude(schema_name='public'):
    connection.set_schema(c.schema_name)
    logs = AuditLog.objects.all().order_by('-created_at')[:5]
    if logs.exists():
        print(f"--- Schema: {c.schema_name} ---")
        for log in logs:
            print(f"User: {log.nom_utilisateur}, Role: {log.role_utilisateur}, Action: {log.type_action}")
