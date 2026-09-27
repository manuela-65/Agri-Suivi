import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
User = get_user_model()

def run():
    user = User.objects.filter(role='PROPRIETAIRE').first()
    if not user:
        print("No user")
        return
    client = Client()
    client.force_login(user)
    print(f"Logged in as {user.email}")
    
    tenant = getattr(user, 'tenant', None)
    if tenant:
        domain = tenant.domains.first()
        if domain:
            host = domain.domain
            print(f"Using host: {host}")
            res = client.post('/api/assistant/chat/', {'message': 'Hello'}, HTTP_HOST=host)
            print("Status:", res.status_code)
            if res.status_code == 500:
                print("Content:")
                print(res.content.decode())
            else:
                print(res.json())

run()
