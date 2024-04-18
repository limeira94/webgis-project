from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/main/', include('main.urls')),
    path('api/users/', include('users.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


paths_react = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('map', TemplateView.as_view(template_name='index.html')),
    path('login/', TemplateView.as_view(template_name='index.html'), name='login'),
    path('register/', TemplateView.as_view(template_name='index.html'), name='register'),
    path('dashboard/', TemplateView.as_view(template_name='index.html'), name='dashboard'),
    path('reset/', TemplateView.as_view(template_name='index.html'), name='reset'),
    path('project/', TemplateView.as_view(template_name='index.html'), name='project'),
    path('about/', TemplateView.as_view(template_name='index.html'), name='about'),
]


urlpatterns += paths_react