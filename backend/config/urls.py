"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
import os

# Define a view that serves the React app's index.html
class ReactAppView(TemplateView):
    template_name = "index.html"  # This will be found in FRONTEND_DIR
    
    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except:
            # Fallback to a basic template if index.html isn't found
            return HttpResponse("""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Introspect</title>
                </head>
                <body>
                    <div id="root"></div>
                    <script type="module" src="/assets/index.js"></script>
                </body>
                </html>
            """)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Serve static files directly from the assets directory
    path('assets/<path:path>', lambda request, path: static.serve(
        request, path, document_root=os.path.join(settings.FRONTEND_DIR, 'assets')
    )),
    # Serve the favicon if present
    path('favicon.ico', lambda request: static.serve(
        request, 'favicon.ico', document_root=settings.FRONTEND_DIR
    ), name='favicon'),
    # Serve the vite.svg icon
    path('vite.svg', lambda request: static.serve(
        request, 'vite.svg', document_root=settings.FRONTEND_DIR
    ), name='vite-icon'),
    # Catch all other routes and serve the React app
    re_path(r'^.*', ReactAppView.as_view(), name='frontend'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)