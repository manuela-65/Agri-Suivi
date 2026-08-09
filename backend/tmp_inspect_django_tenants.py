import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')

django.setup()

import inspect
import django_tenants.middleware.main as m
print('TenantMainMiddleware source:\n')
print(inspect.getsource(m.TenantMainMiddleware))
