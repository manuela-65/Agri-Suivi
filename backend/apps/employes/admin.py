from django.contrib import admin
from .models import Employe, TacheEmploye

@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'poste', 'telephone', 'salaire_mensuel', 'statut', 'date_embauche')
    list_filter = ('statut', 'poste')
    search_fields = ('nom', 'prenom', 'poste')

@admin.register(TacheEmploye)
class TacheEmployeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'employe', 'priorite', 'statut', 'date_debut', 'date_echeance')
    list_filter = ('statut', 'priorite')
    search_fields = ('titre', 'description')
