import http.client

TEST_TENANT = 'tenant_7c44644f'
HOST = '127.0.0.1'
PORT = 8000

# GET without tenant header
conn = http.client.HTTPConnection(HOST, PORT, timeout=10)
conn.request('GET', '/api/auth/token/')
r = conn.getresponse()
print('GET /api/auth/token/ without tenant ->', r.status, r.reason)
print(r.read().decode('utf-8', errors='replace')[:800])
conn.close()

# POST with X-Tenant-ID header
conn = http.client.HTTPConnection(HOST, PORT, timeout=10)
headers = {'Content-Type': 'application/json', 'X-Tenant-ID': TEST_TENANT}
body = '{"username": "test+tenant_7c44644f@example.com", "password": "Secret123!"}'
conn.request('POST', '/api/auth/token/', body=body, headers=headers)
r = conn.getresponse()
print('POST /api/auth/token/ with X-Tenant-ID ->', r.status, r.reason)
print(r.read().decode('utf-8', errors='replace')[:800])
conn.close()

# POST with explicit Host header for tenant domain
conn = http.client.HTTPConnection(HOST, PORT, timeout=10)
headers = {
    'Content-Type': 'application/json',
    'Host': f'{TEST_TENANT}.localhost',
}
body = '{"username": "test+tenant_7c44644f@example.com", "password": "Secret123!"}'
conn.request('POST', '/api/auth/token/', body=body, headers=headers)
r = conn.getresponse()
print('POST /api/auth/token/ with Host header ->', r.status, r.reason)
print(r.read().decode('utf-8', errors='replace')[:800])
conn.close()
