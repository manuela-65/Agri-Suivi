from .models import AuditLog

class AuditLogMiddleware:
    """
    Middleware Django enregistrant automatiquement une entrée de traçabilité
    pour chaque modification effectuée par un utilisateur authentifié.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Check if DRF user is attached by a view, or try to authenticate with JWT
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            try:
                from rest_framework_simplejwt.authentication import JWTAuthentication
                jwt_auth = JWTAuthentication()
                auth_result = jwt_auth.authenticate(request)
                if auth_result:
                    user, token = auth_result
            except Exception:
                pass

        # Enregistrer seulement si l'utilisateur est connecté et que l'action est modificatrice
        if user and user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if response.status_code in [200, 201, 204]:
                action_map = {
                    'POST': 'CREATION',
                    'PUT': 'MODIFICATION',
                    'PATCH': 'MODIFICATION',
                    'DELETE': 'SUPPRESSION'
                }
                path_parts = [p for p in request.path.split('/') if p]
                module_name = path_parts[1].capitalize() if len(path_parts) > 1 else 'Système'

                ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR')

                # Generate a human-readable description
                action_desc = "a effectué une action"
                if request.method == 'POST':
                    if 'cultures/list' in request.path: action_desc = "a enregistré une nouvelle production (Culture)"
                    elif 'cultures/elevages' in request.path: action_desc = "a enregistré une nouvelle production (Élevage)"
                    elif 'stocks/articles' in request.path: action_desc = "a ajouté un nouvel article au stock"
                    elif 'stocks/mouvements' in request.path: action_desc = "a enregistré un mouvement de stock"
                    elif 'employes/list' in request.path: action_desc = "a ajouté un nouvel employé"
                    elif 'finances/list' in request.path: action_desc = "a enregistré une transaction financière"
                    else: action_desc = "a créé un nouvel enregistrement"
                elif request.method in ['PUT', 'PATCH']:
                    if 'exploitation/parametres' in request.path: action_desc = "a modifié les paramètres de l'exploitation"
                    elif 'cultures/list' in request.path: action_desc = "a modifié une production (Culture)"
                    elif 'cultures/elevages' in request.path: action_desc = "a modifié une production (Élevage)"
                    elif 'stocks/articles' in request.path: action_desc = "a mis à jour un article du stock"
                    elif 'employes/list' in request.path: action_desc = "a mis à jour le profil d'un employé"
                    else: action_desc = "a modifié un enregistrement"
                elif request.method == 'DELETE':
                    if 'cultures' in request.path: action_desc = "a supprimé une production"
                    elif 'stocks' in request.path: action_desc = "a supprimé un élément du stock"
                    elif 'employes' in request.path: action_desc = "a supprimé un employé"
                    else: action_desc = "a supprimé un enregistrement"

                description_finale = f"{user.get_full_name() or user.username} {action_desc}."

                from django.db import connection
                if connection.schema_name != 'public':
                    AuditLog.objects.create(
                        utilisateur=user,
                        nom_utilisateur=user.get_full_name() or user.username,
                        role_utilisateur=user.role if hasattr(user, 'role') else 'N/A',
                        type_action=action_map.get(request.method, 'MODIFICATION'),
                        module=module_name,
                        description=description_finale,
                        ip_address=ip
                    )

        return response
