from django.contrib import admin
from django.urls import path, include, re_path
from .views import media_file, tenant_home
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', tenant_home, name='tenant-home'),
    re_path(r'^media/(?P<path>.*)$', media_file, name='media-file'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/exploitation/', include('apps.exploitations.urls')),
    path('api/employes/', include('apps.employes.urls')),
    path('api/cultures/', include('apps.cultures.urls')),
    path('api/stocks/', include('apps.stocks.urls')),
    path('api/finances/', include('apps.finances.urls')),
    path('api/tracabilite/', include('apps.tracabilite.urls')),
    path('api/rapports/', include('apps.rapports.urls')),
    path('api/assistant/', include('apps.assistant_ia.urls')),
]

