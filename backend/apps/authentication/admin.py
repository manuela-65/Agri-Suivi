from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active_employee')
    list_filter = ('role', 'is_active_employee', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Informations SaaS AgriSuivi', {'fields': ('role', 'phone', 'avatar', 'is_active_employee')}),
    )
