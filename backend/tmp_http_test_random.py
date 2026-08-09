import json
import urllib.request
import urllib.error
import uuid

suffix = uuid.uuid4().hex[:8]
register_data = {
    'farm_name': f'Test Debug {suffix}',
    'schema_name': f'test_debug_{suffix}',
    'owner_name': 'Test Debug',
    'email': f'test_debug_{suffix}@example.com',
    'password': 'Secret123!',
    'phone': f'+23769000{suffix[:4]}',
    'region': 'Centre'
}

login_data = {
    'username': register_data['email'],
    'password': register_data['password']
}

requests = [
    ('/api/tenants/register/', register_data),
    ('/api/auth/token/', login_data)
]

for path, payload in requests:
    url = f'http://127.0.0.1:8000{path}'
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    print('=== Request', path)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode('utf-8', errors='replace')
            print('status', resp.status)
            print('body', body)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print('status', e.code)
        print('body', body)
        break
    except Exception as e:
        print('error', e)
        break
