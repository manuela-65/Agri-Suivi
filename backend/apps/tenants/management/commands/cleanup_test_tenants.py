from django.core.management.base import BaseCommand
from apps.tenants.models import Client, Domain
from apps.authentication.models import CustomUser
from django.db import connection

TEST_SCHEMAS = ['test_debug_01', 'test_debug_02']
TEST_EMAILS = ['test_debug_01@example.com', 'test_debug_02@example.com']

class Command(BaseCommand):
    help = 'Cleanup test tenants and drop their schemas'

    def handle(self, *args, **options):
        for email in TEST_EMAILS:
            users = CustomUser.objects.filter(email=email)
            if users.exists():
                self.stdout.write(f"Deleting test user(s) with email {email}")
                users.delete()
            else:
                self.stdout.write(f"No shared user with email {email}")

        for schema in TEST_SCHEMAS:
            tenant = Client.objects.filter(schema_name=schema).first()
            if tenant:
                self.stdout.write(f"Deleting tenant record and domains for {schema}")
                Domain.objects.filter(tenant=tenant).delete()
                tenant.delete()
            else:
                self.stdout.write(f"No Client record for {schema}")

            try:
                with connection.cursor() as cur:
                    cur.execute(f"DROP SCHEMA IF EXISTS {schema} CASCADE;")
                    self.stdout.write(f"Dropped schema {schema} (if existed)")
            except Exception as e:
                self.stderr.write(f"Error dropping schema {schema}: {e}")

        self.stdout.write('Cleanup complete')
