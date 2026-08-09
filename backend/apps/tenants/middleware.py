from django.utils.deprecation import MiddlewareMixin
from django_tenants.middleware.main import TenantMainMiddleware
from django_tenants.utils import remove_www

LOCAL_HOST_IDENTIFIERS = ('localhost', '127.0.0.1', '::1', '0.0.0.0')


def normalized_tenant_host(tenant_id: str) -> str:
    normalized_tenant = tenant_id.strip().lower().replace('-', '_')
    return normalized_tenant.replace('_', '-')


class TenantHostHeaderMiddleware(MiddlewareMixin):
    """Permet de sélectionner un tenant local via l'en-tête X-Tenant-ID.

    Ceci est utile pour le développement local avec django-tenants et localhost,
    lorsque les sous-domaines comme <schema>.localhost ne sont pas configurés
    dans le fichier hosts.
    """

    LOCAL_HOST_IDENTIFIERS = ('localhost', '127.0.0.1', '::1', '0.0.0.0')

    def process_request(self, request):
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        host = request.META.get('HTTP_HOST', '')
        if tenant_id and host and any(local in host for local in self.LOCAL_HOST_IDENTIFIERS):
            request.META['HTTP_HOST'] = 'localhost'
            request.META['SERVER_NAME'] = 'localhost'
            request.META['SERVER_PORT'] = host.split(':')[1] if ':' in host else '80'
            request.META['HTTP_X_ORIGINAL_HOST'] = host


from django.conf import settings
from django.core.exceptions import DisallowedHost
from django.http import HttpResponseNotFound
from django.utils.module_loading import import_string
from django_tenants.utils import (
    connection,
    get_tenant_domain_model,
    get_public_schema_urlconf,
    get_public_schema_name,
    has_multi_type_tenants,
    get_tenant_types,
)
from apps.tenants.models import Client


class CustomTenantMainMiddleware(TenantMainMiddleware):
    """Custom TenantMainMiddleware that supports X-Tenant-ID on localhost.

    When `X-Tenant-ID` is present, tenant selection is performed directly via
    schema_name instead of relying on request.get_host() and django host parsing.
    """

    def process_request(self, request):
        connection.set_schema_to_public()
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        if tenant_id:
            normalized_schema = tenant_id.strip().lower().replace('-', '_')
            try:
                tenant = Client.objects.get(schema_name=normalized_schema)
            except Client.DoesNotExist:
                return self.no_tenant_found(request, normalized_schema)

            tenant.domain_url = f'{normalized_schema}.localhost'
            public_paths = (
                '/api/auth/',
                '/api/tenants/',
            )
            if any(request.path.startswith(path) for path in public_paths):
                request.tenant = None
                connection.set_schema_to_public()
                self.setup_url_routing(request, force_public=True)
            else:
                request.tenant = tenant
                connection.set_tenant(request.tenant)
                self.setup_url_routing(request)
            return

        try:
            hostname = self.hostname_from_request(request)
        except DisallowedHost:
            return HttpResponseNotFound()

        if hostname in LOCAL_HOST_IDENTIFIERS:
            connection.set_schema_to_public()
            request.tenant = None
            self.setup_url_routing(request, force_public=True)
            return

        domain_model = get_tenant_domain_model()
        try:
            tenant = self.get_tenant(domain_model, hostname)
        except domain_model.DoesNotExist:
            return self.no_tenant_found(request, hostname)

        tenant.domain_url = hostname
        request.tenant = tenant
        connection.set_tenant(request.tenant)
        self.setup_url_routing(request)

    @staticmethod
    def hostname_from_request(request):
        if request.META.get('HTTP_X_TENANT_ID'):
            normalized_schema = request.META['HTTP_X_TENANT_ID'].strip().lower().replace('-', '_')
            return f'{normalized_schema}.localhost'

        host = request.META.get('HTTP_HOST', '')
        if ':' in host:
            host = host.split(':')[0]
        return remove_www(host)

    @staticmethod
    def setup_url_routing(request, force_public=False):
        public_schema_name = get_public_schema_name()
        if has_multi_type_tenants():
            tenant_types = get_tenant_types()
            if (not hasattr(request, 'tenant') or
                    ((force_public or request.tenant.schema_name == public_schema_name) and
                     'URLCONF' in tenant_types[public_schema_name])):
                request.urlconf = get_public_schema_urlconf()
            else:
                tenant_type = request.tenant.get_tenant_type()
                request.urlconf = tenant_types[tenant_type]['URLCONF']

        else:
            if (hasattr(settings, 'PUBLIC_SCHEMA_URLCONF') and
                    (force_public or request.tenant.schema_name == public_schema_name)):
                request.urlconf = settings.PUBLIC_SCHEMA_URLCONF
            else:
                request.urlconf = settings.ROOT_URLCONF

    def get_tenant(self, domain_model, hostname):
        try:
            return super().get_tenant(domain_model, hostname)
        except domain_model.DoesNotExist:
            alternate = hostname.replace('-', '_') if '-' in hostname else hostname.replace('_', '-')
            if alternate != hostname:
                return super().get_tenant(domain_model, alternate)
            raise
