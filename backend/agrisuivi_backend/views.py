import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
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


def media_file(request, path):
    file_path = (Path(settings.MEDIA_ROOT) / path).resolve()
    media_root = Path(settings.MEDIA_ROOT).resolve()

    if media_root not in file_path.parents or not file_path.is_file():
        raise Http404

    file_size = file_path.stat().st_size
    content_type = mimetypes.guess_type(file_path.name)[0] or 'application/octet-stream'
    range_header = request.headers.get('Range')

    if not range_header or not range_header.startswith('bytes='):
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Length'] = str(file_size)
        response['Accept-Ranges'] = 'bytes'
        response['Content-Disposition'] = 'inline'
        return response

    try:
        start, end = range_header[6:].split('-', 1)
        start = int(start) if start else 0
        end = int(end) if end else file_size - 1
        end = min(end, file_size - 1)
        if start < 0 or start > end or start >= file_size:
            raise ValueError
    except ValueError:
        return HttpResponse(status=416, headers={'Content-Range': f'bytes */{file_size}'})

    length = end - start + 1

    def read_range():
        with open(file_path, 'rb') as media:
            media.seek(start)
            remaining = length
            while remaining:
                chunk = media.read(min(1024 * 1024, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk

    response = StreamingHttpResponse(read_range(), status=206, content_type=content_type)
    response['Content-Length'] = str(length)
    response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
    response['Accept-Ranges'] = 'bytes'
    response['Content-Disposition'] = 'inline'
    return response
