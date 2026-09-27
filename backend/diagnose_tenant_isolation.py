#!/usr/bin/env python
"""Diagnostiquer l'isolation des données par tenant."""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.db import connection
from django.db.models import Sum
from django_tenants.utils import schema_context
from apps.tenants.models import Client
from apps.cultures.models import Culture, Elevage, Parcelle
from apps.finances.models import Transaction

print("=" * 80)
print("DIAGNOSTIC D'ISOLATION DES DONNÉES PAR TENANT")
print("=" * 80)

# Récupérer tous les tenants
tenants = Client.objects.all()
print(f"\nNombre de tenants: {len(tenants)}\n")

for tenant in tenants:
    schema_name = tenant.schema_name
    print(f"\n{'─' * 80}")
    print(f"TENANT: {schema_name} ({tenant.name})")
    print(f"{'─' * 80}")
    
    # Ignorer le schéma public
    if schema_name == 'public':
        print("  (Schéma public - pas de données métier)")
        continue
    
    with schema_context(schema_name):
        try:
            # Compter les cultures
            cultures = Culture.objects.all()
            print(f"  Cultures: {cultures.count()}")
            if cultures.count() > 0:
                for c in cultures[:3]:
                    print(f"    - {c.variete} (statut: {c.statut})")
            
            # Compter les élevages
            elevages = Elevage.objects.all()
            print(f"  Élevages: {elevages.count()}")
            if elevages.count() > 0:
                for e in elevages[:3]:
                    print(f"    - {e.type_animaux} ({e.nombre_tetes} têtes)")
            
            # Compter les parcelles
            parcelles = Parcelle.objects.all()
            print(f"  Parcelles: {parcelles.count()}")
            if parcelles.count() > 0:
                for p in parcelles[:3]:
                    print(f"    - {p.nom} ({p.superficie} ha)")
            
            # Compter les transactions
            transactions = Transaction.objects.all()
            print(f"  Transactions: {transactions.count()}")
            if transactions.count() > 0:
                # Calculer le solde
                from django.db.models import Sum
                revenus = transactions.filter(type_transaction__in=['VENTE', 'REVENU']).aggregate(total=Sum('montant'))['total'] or 0
                depenses = transactions.filter(type_transaction='DEPENSE').aggregate(total=Sum('montant'))['total'] or 0
                print(f"    - Revenus: {revenus} FCFA")
                print(f"    - Dépenses: {depenses} FCFA")
                print(f"    - Solde: {revenus - depenses} FCFA")
        except Exception as e:
            print(f"  ERREUR: {str(e)}")

print("\n" + "=" * 80)
print("FIN DU DIAGNOSTIC")
print("=" * 80)
