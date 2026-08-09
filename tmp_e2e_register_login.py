import requests, time, json

vite_url = 'http://localhost:5174/api'

schema = f'testui_{int(time.time())}'
payload = {
    'farm_name': 'Test UI Ferme',
    'schema_name': schema,
    'owner_name': 'UI Test Admin',
    'email': f'test+{schema}@example.com',
    'password': 'Secret123!',
    'phone': '+237690000001'
}

headers = {
    'Origin': 'http://localhost:5174',
    'Content-Type': 'application/json'
}

print('Registering tenant via Vite proxy...')
r = requests.post(f'{vite_url}/tenants/register/', json=payload, headers=headers, timeout=10)
print('status', r.status_code)
try:
    print('json', r.json())
except Exception:
    print('text', r.text)

if r.status_code == 201:
    print('\nAttempting login with X-Tenant-ID header')
    creds = {'username': payload['email'], 'password': payload['password']}
    headers_login = {'Origin': 'http://localhost:5174', 'Content-Type': 'application/json', 'X-Tenant-ID': schema}
    r2 = requests.post(f'{vite_url}/auth/token/', json=creds, headers=headers_login, timeout=10)
    print('login status', r2.status_code)
    try:
        print('login json', r2.json())
    except Exception:
        print('login text', r2.text)
else:
    print('Registration failed; not attempting login')
