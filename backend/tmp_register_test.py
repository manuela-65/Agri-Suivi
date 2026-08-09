import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')

django.setup()
from django.test import Client

client = Client(HTTP_HOST='localhost:8000')

schema = f"testreg_{uuid.uuid4().hex[:6]}"
payload = {
    "farm_name": "Test Reg Ferme",
    "schema_name": schema,
    "owner_name": "Test Owner",
    "email": f"test+{schema}@example.com",
    "password": "Secret123!",
    "phone": "+237690000000",
    "region": "Centre"
}

response = client.post('/api/tenants/register/', data=payload, content_type='application/json')
print('STATUS', response.status_code)
try:
    print('JSON:', response.json())
except Exception:
    print('TEXT:', response.content.decode('utf-8', errors='replace'))
