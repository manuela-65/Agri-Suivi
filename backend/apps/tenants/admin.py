from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import Client, Domain

@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'schema_name', 'owner_name', 'owner_email', 'region', 'is_active', 'created_on')
    search_fields = ('name', 'schema_name', 'owner_name', 'owner_email')
    list_filter = ('is_active', 'region')

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'tenant', 'is_primary')
    search_fields = ('domain',)
