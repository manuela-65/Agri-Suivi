from django.http import HttpResponse
from django.urls import reverse


def public_home(request):
    html = """
    <html>
      <head><title>AgriSuivi Public</title></head>
      <body>
        <h1>AgriSuivi - Point d'entrée public</h1>
        <p>Bienvenue sur l'API publique de la plateforme AgriSuivi.</p>
        <ul>
          <li><a href='/admin/'>Administration Django</a></li>
          <li><a href='/api/auth/token/'>Obtenir un token JWT</a></li>
          <li><a href='/api/auth/token/refresh/'>Renouveler un token JWT</a></li>
          <li><a href='/api/auth/me/'>Informations sur l'utilisateur connecté</a></li>
          <li><a href='/api/tenants/register/'>Créer un nouveau tenant</a></li>
          <li><a href='/api/tenants/list/'>Lister les tenants</a></li>
        </ul>
      </body>
    </html>
    """
    return HttpResponse(html)


def tenant_home(request):
    html = """
    <html>
      <head><title>AgriSuivi Tenant</title></head>
      <body>
        <h1>AgriSuivi - Tenant actif</h1>
        <p>Vous êtes dans le schéma du tenant actif.</p>
        <ul>
          <li><a href='/admin/'>Administration Django</a></li>
          <li><a href='/api/auth/me/'>Informations utilisateur</a></li>
          <li><a href='/api/cultures/'>Gestion des cultures</a></li>
          <li><a href='/api/employes/'>Gestion des employés</a></li>
          <li><a href='/api/stocks/'>Gestion des stocks</a></li>
          <li><a href='/api/finances/'>Transactions et bilan</a></li>
          <li><a href='/api/rapports/dashboard/'>Statistiques tableau de bord</a></li>
        </ul>
      </body>
    </html>
    """
    return HttpResponse(html)
