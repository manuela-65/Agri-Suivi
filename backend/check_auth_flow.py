import json
import uuid
import http.client

BASE_HOST = 'localhost'
BASE_PORT = 8000


def post(path, payload, headers=None):
    conn = http.client.HTTPConnection(BASE_HOST, BASE_PORT, timeout=10)
    body = json.dumps(payload)
    request_headers = {
        'Content-Type': 'application/json',
    }
    if headers:
        request_headers.update(headers)
    conn.request('POST', path, body=body, headers=request_headers)
    response = conn.getresponse()
    data = response.read().decode('utf-8', errors='replace')
    return response.status, response.reason, data


if __name__ == '__main__':
    schema = f'tenant_{uuid.uuid4().hex[:8]}'
    register_payload = {
        'farm_name': 'Test Ferme',
        'schema_name': schema,
        'owner_name': 'Test Admin',
        'email': f'test+{schema}@example.com',
        'password': 'Secret123!',
        'phone': '+237690000000',
        'region': 'Centre',
    }

    print('Register payload schema:', schema)
    status, reason, body = post('/api/tenants/register/', register_payload)
    print('REGISTER', status, reason)
    print(body)

    if status != 201:
        raise SystemExit(1)

    login_payload = {'username': register_payload['email'], 'password': register_payload['password']}
    headers = {'X-Tenant-ID': schema}
    status, reason, body = post('/api/auth/token/', login_payload, headers=headers)
    print('LOGIN', status, reason)
    print(body)
    if status != 200:
        raise SystemExit(1)
