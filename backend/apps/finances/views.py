from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from django.db.models import Sum
from apps.authentication.permissions import IsAccountant, IsEmployee
from .models import CategorieTransaction, Transaction
from .serializers import CategorieTransactionSerializer, TransactionSerializer

class CategorieTransactionViewSet(viewsets.ModelViewSet):
    queryset = CategorieTransaction.objects.all()
    serializer_class = CategorieTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountant]


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date_transaction', '-id')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountant]

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)


class BilanFinancierView(views.APIView):
    """
    Statistiques financières globales pour le tableau de bord (Ventes, Achats, Revenus, Dépenses, Solde net).
    """
    permission_classes = [permissions.IsAuthenticated, IsEmployee]

    def get(self, request):
        total_ventes = Transaction.objects.filter(type_transaction='VENTE').aggregate(Sum('montant'))['montant__sum'] or 0
        total_revenus = Transaction.objects.filter(type_transaction='REVENU').aggregate(Sum('montant'))['montant__sum'] or 0
        total_achats = Transaction.objects.filter(type_transaction='ACHAT').aggregate(Sum('montant'))['montant__sum'] or 0
        total_depenses = Transaction.objects.filter(type_transaction='DEPENSE').aggregate(Sum('montant'))['montant__sum'] or 0
        
        solde_net = float(total_ventes) + float(total_revenus) - float(total_achats) - float(total_depenses)

        return Response({
            "total_ventes": float(total_ventes),
            "total_revenus": float(total_revenus),
            "total_achats": float(total_achats),
            "total_depenses": float(total_depenses),
            "solde_net": solde_net,
            "devise": "FCFA"
        })
