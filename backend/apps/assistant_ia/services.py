import os
from django.db.models import Sum, Count, F
from django.utils import timezone
from django_tenants.utils import schema_context
from apps.finances.models import Transaction
from apps.stocks.models import ArticleStock
from apps.cultures.models import Culture, Elevage, ActiviteAgricole
from apps.employes.models import Employe

# Charger .env automatiquement si python-dotenv est installé
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None


class AssistantService:
    @staticmethod
    def _build_context(tenant_schema_name):
        """
        Rassemble les informations du tenant pour fournir le contexte au LLM.
        Protégé contre le schéma public qui ne contient pas les tables tenant.
        """
        # Si on est sur le schéma public, pas de données disponibles
        if tenant_schema_name == 'public':
            return "Aucune donnée d'exploitation disponible (schéma public)."

        try:
            # Utiliser schema_context pour s'assurer que les requêtes utilisent le bon schéma
            with schema_context(tenant_schema_name):
                today = timezone.localtime().date()
                start_of_month = today.replace(day=1)

                # Finances
                try:
                    transactions_mois = Transaction.objects.filter(date_transaction__gte=start_of_month)
                    depenses_mois = transactions_mois.filter(type_transaction='DEPENSE').aggregate(total=Sum('montant'))['total'] or 0
                    revenus_mois = transactions_mois.filter(type_transaction__in=['VENTE', 'REVENU']).aggregate(total=Sum('montant'))['total'] or 0
                    solde_mois = revenus_mois - depenses_mois
                    finances_str = f"- Revenus: {revenus_mois} FCFA\n        - Dépenses: {depenses_mois} FCFA\n        - Solde net: {solde_mois} FCFA"
                except Exception:
                    finances_str = "- Données financières non disponibles."

                # Stocks
                try:
                    stocks = ArticleStock.objects.order_by('nom')[:30]
                    stocks_str = "\n".join([
                        f"- {s.nom}: {s.quantite_en_stock} {s.unite_mesure} "
                        f"(seuil d'alerte: {s.seuil_alerte}, statut: "
                        f"{'ALERTE' if s.quantite_en_stock <= s.seuil_alerte else 'OK'})"
                        for s in stocks
                    ]) or "Aucun article en stock."
                except Exception:
                    stocks_str = "Données de stocks non disponibles."

                # Cultures
                try:
                    cultures_actives = Culture.objects.filter(
                        statut__in=['EN_CROISSANCE', 'RECOLTE_EN_COURS']
                    ).select_related('parcelle')
                    cultures_str = "\n".join([
                        f"- {c.variete} ({c.type_culture}) sur {c.parcelle.nom}, "
                        f"semis: {c.date_semis}, récolte prévue: {c.date_recolte_prevue or 'non renseignée'}, "
                        f"statut: {c.statut}, rendement estimé: {c.rendement_estime}"
                        for c in cultures_actives
                    ])
                    if not cultures_str:
                        cultures_str = "Aucune culture active pour le moment."
                except Exception:
                    cultures_str = "Données de cultures non disponibles."

                # Elevage
                try:
                    elevages = Elevage.objects.order_by('type_animaux')[:30]
                    elevages_str = "\n".join([
                        f"- {e.type_animaux}: {e.nombre_tetes} tête(s), "
                        f"bâtiment: {e.batiment or 'non renseigné'}, "
                        f"statut sanitaire: {e.statut_sanitaire}"
                        for e in elevages
                    ]) or "Aucun élevage enregistré."
                except Exception:
                    elevages_str = "Données d'élevage non disponibles."

                # Activités récentes
                try:
                    activites = ActiviteAgricole.objects.select_related(
                        'culture', 'elevage'
                    ).order_by('-date_activite', '-id')[:15]
                    activites_str = "\n".join([
                        f"- {a.date_activite}: {a.type_activite} - {a.description} "
                        f"(coût: {a.cout_associe} FCFA, "
                        f"cible: {a.culture.variete if a.culture else a.elevage.type_animaux if a.elevage else 'générale'})"
                        for a in activites
                    ]) or "Aucune activité récente enregistrée."
                except Exception:
                    activites_str = "Données d'activités non disponibles."

                # Employés
                try:
                    total_employes = Employe.objects.filter(statut='ACTIF').count()
                except Exception:
                    total_employes = "N/A"

                context = f"""
        Voici les données actuelles de l'exploitation (Tenant: {tenant_schema_name}) :

        [FINANCES - MOIS EN COURS]
        {finances_str}

        [STOCKS FAIBLES OU EN ALERTE]
        {stocks_str}

        [CULTURES ACTIVES]
        {cultures_str}

        [ELEVAGES]
        {elevages_str}

        [ACTIVITÉS RÉCENTES]
        {activites_str}

        [ÉQUIPE]
        - Employés actifs : {total_employes}
        """
                return context

        except Exception as e:
            return f"Contexte non disponible pour le moment ({str(e)})."

    @staticmethod
    def get_ai_response(user_message, history=None, tenant_schema=None):
        if not history:
            history = []

        api_key = os.environ.get('AI_API_KEY')
        if not api_key:
            return "Désolé, la clé API de l'assistant (AI_API_KEY) n'est pas configurée sur le serveur."

        if not genai:
            return "Désolé, le package google-genai n'est pas installé sur le serveur."

        try:
            client = genai.Client(api_key=api_key)

            # Déterminer le schéma à utiliser
            if not tenant_schema:
                from django.db import connection
                tenant_schema = connection.schema_name

            # Construire le contexte avec le schéma explicite (protégé contre les erreurs DB)
            try:
                context = AssistantService._build_context(tenant_schema)
            except Exception:
                context = "Contexte non disponible."

            system_instruction = (
                "Tu es l'Assistant IA d'AgriSuivi, une plateforme SaaS de gestion agricole. "
                "Tu t'adresses au propriétaire de l'exploitation. Sois professionnel, clair, prudent et concis. "
                "Tu peux répondre aux questions sur les cultures, l'élevage, les activités, les stocks et les finances. "
                "Utilise UNIQUEMENT les données du contexte fourni ci-dessous pour les faits concernant l'exploitation. "
                "Si la question concerne des données qui ne sont pas dans le contexte, indique poliment que tu n'as pas cette information pour le moment.\n\n"
                "Ne présente jamais un conseil comme un diagnostic certain. Pour les problèmes sanitaires, "
                "les traitements, les médicaments ou les décisions à risque, recommande de consulter un vétérinaire, "
                "un agronome ou un autre expert local. Termine les conseils pratiques importants par : "
                "'Ces informations ne remplacent pas l'avis d'un expert agricole.'\n\n"
                f"CONTEXTE:\n{context}"
            )

            # Construire l'historique au format attendu par genai
            contents = []
            for msg in history:
                role = "user" if msg.role == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))

            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                )
            )

            return response.text

        except Exception as e:
            return f"Erreur lors de la communication avec l'IA : {str(e)}"
