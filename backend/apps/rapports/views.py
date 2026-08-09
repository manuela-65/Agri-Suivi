from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Sum, Count, F

from apps.authentication.permissions import IsEmployee
from apps.employes.models import Employe
from apps.cultures.models import Culture, Parcelle, Elevage
from apps.stocks.models import ArticleStock, MouvementStock
from apps.finances.models import Transaction
from apps.tracabilite.models import AuditLog

def parse_date(value):
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except Exception:
        return None


def get_date_range(filter_type, start_date=None, end_date=None):
    now = timezone.now().date()
    if filter_type == 'today':
        return now, now
    elif filter_type == 'week':
        return now - timedelta(days=7), now
    elif filter_type == 'month':
        return now - timedelta(days=30), now
    elif filter_type == 'year':
        return now - timedelta(days=365), now
    elif filter_type == 'custom' and start_date and end_date:
        start = parse_date(start_date)
        end = parse_date(end_date)
        if start and end:
            return start, end
    return None, None


class DashboardStatsView(views.APIView):
    """
    Fournit les KPI clés du tableau de bord.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get(self, request):
        total_employes = Employe.objects.filter(statut='ACTIF').count()
        total_cultures = Culture.objects.filter(statut='EN_CROISSANCE').count()
        total_parcelles = Parcelle.objects.count()
        total_elevages = Elevage.objects.aggregate(total=Sum('nombre_tetes'))['total'] or 0

        total_ventes = Transaction.objects.filter(type_transaction='VENTE').aggregate(Sum('montant'))['montant__sum'] or 0.0
        total_revenus = Transaction.objects.filter(type_transaction='REVENU').aggregate(Sum('montant'))['montant__sum'] or 0.0
        total_achats = Transaction.objects.filter(type_transaction='ACHAT').aggregate(Sum('montant'))['montant__sum'] or 0.0
        total_depenses = Transaction.objects.filter(type_transaction='DEPENSE').aggregate(Sum('montant'))['montant__sum'] or 0.0
        recettes = float(total_ventes) + float(total_revenus)
        depenses = float(total_achats) + float(total_depenses)
        solde_net = recettes - depenses

        alertes_count = ArticleStock.objects.filter(quantite_en_stock__lte=F('seuil_alerte')).count()

        return Response({
            "kpi": {
                "employes_actifs": total_employes,
                "cultures_en_cours": total_cultures,
                "parcelles_totales": total_parcelles,
                "tetes_betail": total_elevages,
                "alertes_stock": alertes_count
            },
            "finances": {
                "recettes": recettes,
                "depenses": depenses,
                "total_ventes": total_ventes,
                "total_revenus": total_revenus,
                "total_achats": total_achats,
                "total_depenses": total_depenses,
                "solde_net": solde_net,
                "devise": "FCFA"
            }
        })


class GenererRapportView(views.APIView):
    """
    Endpoint pour la génération de rapports filtrés par date.
    Types de rapports : 'financier', 'employes', 'stocks', 'cultures', 'transactions'.
    Filtres : 'today', 'week', 'month', 'year', 'custom'.
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get(self, request):
        type_rapport = request.query_params.get('type', 'financier')
        periode = request.query_params.get('periode', 'month')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        d_start, d_end = get_date_range(periode, start_date, end_date)

        data = {
            "type_rapport": type_rapport,
            "periode": periode,
            "date_generation": timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        if type_rapport in ['financier', 'transactions']:
            qs = Transaction.objects.all()
            if d_start and d_end:
                qs = qs.filter(date_transaction__range=[d_start, d_end])
            ventes = qs.filter(type_transaction='VENTE').aggregate(Sum('montant'))['montant__sum'] or 0
            revenus = qs.filter(type_transaction='REVENU').aggregate(Sum('montant'))['montant__sum'] or 0
            achats = qs.filter(type_transaction='ACHAT').aggregate(Sum('montant'))['montant__sum'] or 0
            depenses = qs.filter(type_transaction='DEPENSE').aggregate(Sum('montant'))['montant__sum'] or 0
            data.update({
                "total_ventes": ventes,
                "total_revenus": revenus,
                "total_achats": achats,
                "total_depenses": depenses,
                "solde_net": float(ventes + revenus) - float(achats + depenses),
                "nombre_transactions": qs.count(),
                "details": list(qs.values('id', 'description', 'type_transaction', 'montant', 'date_transaction', 'mode_paiement', 'reference_recu'))
            })

        elif type_rapport == 'employes':
            qs = Employe.objects.all()
            data.update({
                "total_employes": qs.count(),
                "actifs": qs.filter(statut='ACTIF').count(),
                "masse_salariale_mensuelle": qs.aggregate(Sum('salaire_mensuel'))['salaire_mensuel__sum'] or 0,
                "details": list(qs.values('id', 'nom', 'prenom', 'poste', 'salaire_mensuel', 'statut', 'date_embauche'))
            })

        elif type_rapport == 'stocks':
            qs_articles = ArticleStock.objects.all()
            qs_mouvements = MouvementStock.objects.all()
            if d_start and d_end:
                qs_mouvements = qs_mouvements.filter(date_mouvement__range=[d_start, d_end])
            alertes = qs_articles.filter(quantite_en_stock__lte=F('seuil_alerte')).count()
            data.update({
                "total_articles": qs_articles.count(),
                "alertes_stock": alertes,
                "articles": list(qs_articles.values('id', 'nom', 'quantite_en_stock', 'unite_mesure', 'seuil_alerte')),
                "mouvements_recents": list(qs_mouvements.values('id', 'article__nom', 'type_mouvement', 'quantite', 'date_mouvement'))
            })

        elif type_rapport == 'cultures':
            qs = Culture.objects.all()
            data.update({
                "total_cultures": qs.count(),
                "en_croissance": qs.filter(statut='EN_CROISSANCE').count(),
                "details": list(qs.values('id', 'variete', 'parcelle__nom', 'type_culture', 'date_semis', 'statut'))
            })

        # Traçabilité automatique du rapport généré
        AuditLog.objects.create(
            utilisateur=request.user,
            nom_utilisateur=request.user.get_full_name() or request.user.username,
            role_utilisateur=request.user.role if hasattr(request.user, 'role') else 'N/A',
            type_action='EXPORT',
            module='Rapports',
            description=f"Génération d'un rapport {type_rapport} (période: {periode})"
        )

        return Response(data)
