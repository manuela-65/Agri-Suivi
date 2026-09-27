from django.utils.deprecation import MiddlewareMixin
from django_tenants.middleware.main import TenantMainMiddleware
from django_tenants.utils import (
    connection,
    get_tenant_domain_model,
    get_public_schema_urlconf,
    get_public_schema_name,
    has_multi_type_tenants,
    get_tenant_types,
    remove_www,
)
from django.conf import settings
from django.core.exceptions import DisallowedHost
from django.http import HttpResponseNotFound

from apps.tenants.models import Client


# ==============================================================================
# HÔTES LOCAUX
# ==============================================================================

LOCAL_HOST_IDENTIFIERS = (
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
)


def normalized_tenant_host(tenant_id: str) -> str:
    """
    Normalise un identifiant de tenant.

    Exemple :
        ferme-alpha -> ferme-alpha
        ferme_alpha -> ferme-alpha
    """
    normalized_tenant = tenant_id.strip().lower().replace('-', '_')
    return normalized_tenant.replace('_', '-')


# ==============================================================================
# MIDDLEWARE X-TENANT-ID
# ==============================================================================

class TenantHostHeaderMiddleware(MiddlewareMixin):
    """
    Permet de sélectionner un tenant local via l'en-tête X-Tenant-ID.

    Utile en développement local avec django-tenants et localhost,
    lorsque les sous-domaines comme <schema>.localhost ne sont pas
    directement utilisés.
    """

    LOCAL_HOST_IDENTIFIERS = (
        'localhost',
        '127.0.0.1',
        '::1',
        '0.0.0.0',
    )

    def process_request(self, request):
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        host = request.META.get('HTTP_HOST', '')

        if (
            tenant_id
            and host
            and any(local in host for local in self.LOCAL_HOST_IDENTIFIERS)
        ):
            request.META['HTTP_HOST'] = 'localhost'
            request.META['SERVER_NAME'] = 'localhost'

            if ':' in host:
                request.META['SERVER_PORT'] = host.split(':')[1]
            else:
                request.META['SERVER_PORT'] = '80'

            request.META['HTTP_X_ORIGINAL_HOST'] = host


# ==============================================================================
# MIDDLEWARE PRINCIPAL MULTI-TENANT
# ==============================================================================

class CustomTenantMainMiddleware(TenantMainMiddleware):
    """
    Version personnalisée de TenantMainMiddleware.

    Elle permet :

    1. La sélection d'un tenant avec X-Tenant-ID.
    2. Le fonctionnement avec localhost / 127.0.0.1.
    3. L'accès à Django Admin sur le schéma public.
    4. Le fonctionnement classique avec les domaines :
       fermealpha.localhost
       fermebeta.localhost
    """

    def process_request(self, request):

        # ----------------------------------------------------------------------
        # Toujours commencer sur le schéma public
        # ----------------------------------------------------------------------

        connection.set_schema_to_public()

        tenant_id = request.META.get('HTTP_X_TENANT_ID')

        # ======================================================================
        # CAS 1 : TENANT FOURNI PAR X-TENANT-ID
        # ======================================================================

        if tenant_id:

            normalized_schema = (
                tenant_id.strip()
                .lower()
                .replace('-', '_')
            )

            try:
                tenant = Client.objects.get(
                    schema_name=normalized_schema
                )

            except Client.DoesNotExist:
                return self.no_tenant_found(
                    request,
                    normalized_schema
                )

            tenant.domain_url = f'{normalized_schema}.localhost'

            # Routes qui doivent rester sur le schéma public
            public_paths = (
                '/api/auth/',
                '/api/tenants/',
            )

            if any(
                request.path.startswith(path)
                for path in public_paths
            ):

                # --------------------------------------------------------------
                # CORRECTION :
                # On utilise maintenant le tenant PUBLIC au lieu de None.
                # --------------------------------------------------------------

                public_schema_name = get_public_schema_name()

                try:
                    public_tenant = Client.objects.get(
                        schema_name=public_schema_name
                    )

                except Client.DoesNotExist:
                    return self.no_tenant_found(
                        request,
                        public_schema_name
                    )

                request.tenant = public_tenant

                connection.set_tenant(
                    public_tenant
                )

                self.setup_url_routing(
                    request,
                    force_public=True
                )

            else:

                # --------------------------------------------------------------
                # Tenant normal
                # --------------------------------------------------------------

                request.tenant = tenant

                connection.set_tenant(
                    request.tenant
                )

                self.setup_url_routing(request)

            return

        # ======================================================================
        # CAS 2 : DÉTECTION DU DOMAINE
        # ======================================================================

        try:

            hostname = self.hostname_from_request(
                request
            )

        except DisallowedHost:

            return HttpResponseNotFound()

        # ======================================================================
        # CAS 3 : LOCALHOST / 127.0.0.1
        # ======================================================================

        if hostname in LOCAL_HOST_IDENTIFIERS:

            public_schema_name = get_public_schema_name()

            try:

                public_tenant = Client.objects.get(
                    schema_name=public_schema_name
                )

            except Client.DoesNotExist:

                return self.no_tenant_found(
                    request,
                    public_schema_name
                )

            # ------------------------------------------------------------------
            # CORRECTION PRINCIPALE
            #
            # Avant :
            #
            # request.tenant = None
            #
            # Maintenant :
            #
            # request.tenant = public_tenant
            # ------------------------------------------------------------------

            request.tenant = public_tenant

            connection.set_tenant(
                public_tenant
            )

            self.setup_url_routing(
                request,
                force_public=True
            )

            return

        # ======================================================================
        # CAS 4 : DOMAINE TENANT CLASSIQUE
        # ======================================================================

        domain_model = get_tenant_domain_model()

        try:

            tenant = self.get_tenant(
                domain_model,
                hostname
            )

        except domain_model.DoesNotExist:

            return self.no_tenant_found(
                request,
                hostname
            )

        tenant.domain_url = hostname

        request.tenant = tenant

        connection.set_tenant(
            request.tenant
        )

        self.setup_url_routing(request)

    # ==========================================================================
    # DÉTERMINATION DU HOST
    # ==========================================================================

    @staticmethod
    def hostname_from_request(request):

        # ----------------------------------------------------------------------
        # Si X-Tenant-ID est présent
        # ----------------------------------------------------------------------

        if request.META.get('HTTP_X_TENANT_ID'):

            normalized_schema = (
                request.META['HTTP_X_TENANT_ID']
                .strip()
                .lower()
                .replace('-', '_')
            )

            return f'{normalized_schema}.localhost'

        # ----------------------------------------------------------------------
        # Sinon récupérer HTTP_HOST
        # ----------------------------------------------------------------------

        host = request.META.get(
            'HTTP_HOST',
            ''
        )

        if ':' in host:
            host = host.split(':')[0]

        return remove_www(host)

    # ==========================================================================
    # CONFIGURATION DU ROUTAGE DES URL
    # ==========================================================================

    @staticmethod
    def setup_url_routing(
        request,
        force_public=False
    ):

        public_schema_name = get_public_schema_name()

        # ----------------------------------------------------------------------
        # Gestion des tenants de différents types
        # ----------------------------------------------------------------------

        if has_multi_type_tenants():

            tenant_types = get_tenant_types()

            if (
                not hasattr(request, 'tenant')
                or request.tenant is None
                or (
                    (
                        force_public
                        or request.tenant.schema_name
                        == public_schema_name
                    )
                    and
                    'URLCONF'
                    in tenant_types[public_schema_name]
                )
            ):

                request.urlconf = get_public_schema_urlconf()

            else:

                tenant_type = (
                    request.tenant.get_tenant_type()
                )

                request.urlconf = (
                    tenant_types[tenant_type]['URLCONF']
                )

        # ----------------------------------------------------------------------
        # Configuration normale
        # ----------------------------------------------------------------------

        else:

            if (
                hasattr(
                    settings,
                    'PUBLIC_SCHEMA_URLCONF'
                )
                and
                (
                    force_public
                    or (
                        hasattr(request, 'tenant')
                        and request.tenant is not None
                        and request.tenant.schema_name
                        == public_schema_name
                    )
                )
            ):

                request.urlconf = (
                    settings.PUBLIC_SCHEMA_URLCONF
                )

            else:

                request.urlconf = (
                    settings.ROOT_URLCONF
                )

    # ==========================================================================
    # RECHERCHE DU TENANT
    # ==========================================================================

    def get_tenant(
        self,
        domain_model,
        hostname
    ):

        try:

            return super().get_tenant(
                domain_model,
                hostname
            )

        except domain_model.DoesNotExist:

            # ------------------------------------------------------------------
            # Permet de gérer les différences entre :
            #
            # ferme-alpha
            # ferme_alpha
            # ------------------------------------------------------------------

            alternate = (
                hostname.replace('-', '_')
                if '-' in hostname
                else hostname.replace('_', '-')
            )

            if alternate != hostname:

                return super().get_tenant(
                    domain_model,
                    alternate
                )

            raise