import os
import sys
import django
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
django.setup()

import inspect
import django_tenants.management.commands.migrate_schemas as mod

print('module file:', Path(mod.__file__).resolve())
print('signature:', inspect.signature(mod.Command.handle))
print('add_arguments source:')
print(inspect.getsource(mod.Command.add_arguments))
print('handle source:')
print(inspect.getsource(mod.Command.handle))
