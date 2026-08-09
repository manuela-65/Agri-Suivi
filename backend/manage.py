#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Patch de compatibilité psycopg2 / Windows pour capturer l'erreur d'encodage CP1252 lors de l'échec de connexion PostgreSQL
try:
    import psycopg2
    _original_connect = psycopg2.connect

    def _patched_connect(*args, **kwargs):
        try:
            return _original_connect(*args, **kwargs)
        except (UnicodeDecodeError, Exception) as err:
            if isinstance(err, UnicodeDecodeError):
                raise psycopg2.OperationalError(
                    "\n\n❌ ECHEC DE CONNEXION À POSTGRESQL !\n"
                    "Le service PostgreSQL n'est pas en cours d'exécution ou la base de données 'agrisuivi_db' n'existe pas.\n\n"
                    "👉 Pour résoudre ce problème :\n"
                    "1. Démarrez le service PostgreSQL (ex: via 'services.msc' sous Windows -> PostgreSQL -> Démarrer).\n"
                    "2. Créez la base de données 'agrisuivi_db' via pgAdmin ou SQL: CREATE DATABASE agrisuivi_db;\n"
                    "3. Assurez-vous que l'utilisateur est 'postgres' avec le mot de passe 'postgres'.\n"
                ) from None
            raise err

    psycopg2.connect = _patched_connect
except ImportError:
    pass

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrisuivi_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
