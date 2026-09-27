from django.contrib import admin
from django.urls import path, include, re_path
from .views import media_file, public_home

urlpatterns = [
    path('', public_home, name='public-home'),
    re_path(r'^media/(?P<path>.*)$', media_file, name='media-file-public'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/tenants/', include('apps.tenants.urls')),
]

