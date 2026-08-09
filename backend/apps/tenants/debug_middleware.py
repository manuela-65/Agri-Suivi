class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        if 'parametres' in request.path:
            print(f"DEBUG: path={request.path} tenant={getattr(request, 'tenant', 'MISSING')} schema={getattr(request, 'tenant', None) and getattr(request.tenant, 'schema_name', None)} urlconf={getattr(request, 'urlconf', 'MISSING')} headers={request.headers.get('X-Tenant-ID')}")
        return self.get_response(request)
