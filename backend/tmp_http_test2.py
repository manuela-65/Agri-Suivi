import json
import urllib.request
import urllib.error

requests = [
    (
        '/api/tenants/register/',
        {
            'farm_name': 'Test Debug 2',
            'schema_name': 'test_debug_02',
            'owner_name': 'Test Debug',
            'email': 'test_debug_02@example.com',
            'password': 'Secret123!',
            'phone': '+237690000002',
            'region': 'Centre'
        }
    ),
    (
        '/api/auth/token/',
        {
            'username': 'test_debug_02@example.com',
            'password': 'Secret123!'
        }
    ),
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
    except Exception as e:
        print('error', e)
