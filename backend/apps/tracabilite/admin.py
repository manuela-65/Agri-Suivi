from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('nom_utilisateur', 'role_utilisateur', 'type_action', 'module', 'created_at', 'ip_address')
    list_filter = ('type_action', 'module', 'created_at')
    search_fields = ('nom_utilisateur', 'description')
    readonly_fields = ('utilisateur', 'nom_utilisateur', 'role_utilisateur', 'type_action', 'module', 'description', 'ip_address', 'created_at')
