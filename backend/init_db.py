import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agrisuivi_backend.settings")
django.setup()

from apps.tenants.models import Client, Domain

def initialize_agrisuivi_tenants():
    print("--- Initialisation de la plateforme Multi-Tenant AgriSuivi ---")
    
    # 1. Schéma Public (Plateforme Admin)
    public_tenant, created = Client.objects.get_or_create(
        schema_name='public',
        defaults={
            'name': 'AgriSuivi Platform Admin',
            'owner_name': 'Administrateur SaaS',
            'owner_email': 'admin@agrisuivi.cm',
            'phone': '+237690000000',
            'region': 'Centre'
        }
    )
    if created:
        print("[OK] Schema 'public' cree avec succes.")
        Domain.objects.create(
            domain='localhost',
            tenant=public_tenant,
            is_primary=True
        )
        print("[OK] Domaine 'localhost' rattache au schema public.")
    else:
        print("[INFO] Le schema 'public' existe deja.")

    print("\n--- Initialisation terminee avec succes ! ---")

if __name__ == "__main__":
    initialize_agrisuivi_tenants()
