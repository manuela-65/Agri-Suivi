import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')

django.setup()
from django.test import Client

client = Client(HTTP_HOST='localhost:8000')

# Existing tenant user created earlier
tenant = 'tenant_7c44644f'
creds = {'username': 'test+tenant_7c44644f@example.com', 'password': 'Secret123!'}

print('Attempt login with correct tenant header')
resp = client.post('/api/auth/token/', data=creds, content_type='application/json', **{'HTTP_X_TENANT_ID': tenant})
print('status', resp.status_code)
try:
    print('json', resp.json())
except Exception:
    print('text', resp.content.decode('utf-8', errors='replace'))

print('\nAttempt login with wrong tenant header (public)')
resp2 = client.post('/api/auth/token/', data=creds, content_type='application/json', **{'HTTP_X_TENANT_ID': 'public'})
print('status', resp2.status_code)
try:
    print('json', resp2.json())
except Exception:
    print('text', resp2.content.decode('utf-8', errors='replace'))

print('\nAttempt login without tenant header')
resp3 = client.post('/api/auth/token/', data=creds, content_type='application/json')
print('status', resp3.status_code)
try:
    print('json', resp3.json())
except Exception:
    print('text', resp3.content.decode('utf-8', errors='replace'))
