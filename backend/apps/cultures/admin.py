from django.contrib import admin
from .models import Parcelle, Culture, Elevage, ActiviteAgricole

@admin.register(Parcelle)
class ParcelleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'superficie', 'type_sol', 'localisation')

@admin.register(Culture)
class CultureAdmin(admin.ModelAdmin):
    list_display = ('variete', 'parcelle', 'type_culture', 'date_semis', 'statut')
    list_filter = ('type_culture', 'statut')

@admin.register(Elevage)
class ElevageAdmin(admin.ModelAdmin):
    list_display = ('type_animaux', 'nombre_tetes', 'batiment', 'statut_sanitaire')

@admin.register(ActiviteAgricole)
class ActiviteAgricoleAdmin(admin.ModelAdmin):
    list_display = ('type_activite', 'date_activite', 'culture', 'elevage', 'employe_responsable', 'cout_associe')
