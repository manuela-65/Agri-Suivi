import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

import django_tenants.utils as utils
print('AVAILABLE NAMES:')
print([name for name in dir(utils) if not name.startswith('_')])
print('\nset_urlconf exists:', hasattr(utils, 'set_urlconf'))
print('\nget_public_schema_urlconf:', getattr(utils, 'get_public_schema_urlconf', None))
print('\nget_tenant_domain_model:', getattr(utils, 'get_tenant_domain_model', None))
print('\nget_public_schema_name:', getattr(utils, 'get_public_schema_name', None))
print('\nhas_multi_type_tenants:', getattr(utils, 'has_multi_type_tenants', None))
print('\nget_tenant_types:', getattr(utils, 'get_tenant_types', None))
