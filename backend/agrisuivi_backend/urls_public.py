from django.contrib import admin
from django.urls import path, include
from .views import public_home

urlpatterns = [
    path('', public_home, name='public-home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/tenants/', include('apps.tenants.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
