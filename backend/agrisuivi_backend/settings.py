import os
from pathlib import Path
from datetime import timedelta

# Charger les variables d'environnement depuis .env
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env' if False else Path(__file__).resolve().parent.parent / '.env')
except ImportError:
    pass

# Patch psycopg2 pour capturer les erreurs de connexion PostgreSQL sur Windows
try:
    import psycopg2
    if not hasattr(psycopg2, '_is_patched'):
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
        psycopg2._is_patched = True
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-agrisuivi-saas-key-2026-cameroun-software-engineering')

DEBUG = True

ALLOWED_HOSTS = ['*']

# ==============================================================================
# CONFIGURATION MULTI-TENANT (django-tenants / Schema-per-Tenant)
# ==============================================================================

SHARED_APPS = [
    'django_tenants',
    'apps.tenants',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'apps.authentication',
]

TENANT_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'apps.exploitations',
    'apps.employes',
    'apps.cultures',
    'apps.stocks',
    'apps.finances',
    'apps.tracabilite',
    'apps.rapports',
    'apps.assistant_ia',
]

INSTALLED_APPS = list(dict.fromkeys(SHARED_APPS + TENANT_APPS))

TENANT_MODEL = "tenants.Client"
TENANT_DOMAIN_MODEL = "tenants.Domain"

DATABASE_ROUTERS = (
    'django_tenants.routers.TenantSyncRouter',
)

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'apps.tenants.middleware.TenantHostHeaderMiddleware',
    'apps.tenants.middleware.CustomTenantMainMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.tracabilite.middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'agrisuivi_backend.urls'

PUBLIC_SCHEMA_URLCONF = 'agrisuivi_backend.urls_public'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'agrisuivi_backend.wsgi.application'

# ==============================================================================
# BASE DE DONNÉES POSTGRESQL (Multi-Tenant Schema Backend)
# ==============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': os.environ.get('DB_NAME', 'agrisuivi_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        }
    }
}

AUTH_USER_MODEL = 'authentication.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================================================================
# DJANGO REST FRAMEWORK & SIMPLE JWT
# ==============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
from corsheaders.defaults import default_headers

# Autoriser l'en-tête custom X-Tenant-ID utilisé pour la sélection de schéma
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-tenant-id',
]
