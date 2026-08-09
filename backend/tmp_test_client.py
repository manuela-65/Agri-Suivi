import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from django.test import Client

client = Client(HTTP_X_TENANT_ID='tenant_7c44644f', HTTP_HOST='127.0.0.1:8000')
response = client.post('/api/auth/token/', '{"username": "test+tenant_7c44644f@example.com", "password": "Secret123!"}', content_type='application/json')
print('status_code=', response.status_code)
print('content=', response.content.decode('utf-8', errors='replace'))
