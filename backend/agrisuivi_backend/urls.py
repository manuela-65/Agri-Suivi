from django.contrib import admin
from django.urls import path, include
from .views import tenant_home
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', tenant_home, name='tenant-home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/exploitation/', include('apps.exploitations.urls')),
    path('api/employes/', include('apps.employes.urls')),
    path('api/cultures/', include('apps.cultures.urls')),
    path('api/stocks/', include('apps.stocks.urls')),
    path('api/finances/', include('apps.finances.urls')),
    path('api/tracabilite/', include('apps.tracabilite.urls')),
    path('api/rapports/', include('apps.rapports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
