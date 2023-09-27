from django.urls import path
from django.shortcuts import render
from django.urls import path, re_path
from . import views
# from .views import HomePageView, LoginAPIView, GeoJSONFileUploadAPIView, UserRegistrarionView

def render_react(request):
    return render(request, "index.html")

urlpatterns = [
    re_path(r"^$", render_react),
    re_path(r"^(?:.*)/?$", render_react),
    # path('', views.HomePageView.as_view(), name='homepage'),
    path('api/main/upload/', views.GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
    path('api/main/geojson/<int:pk>/', views.GeoJSONDetailView.as_view(), name='get_geojson'),
    path('api/main/geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('api/main/register/', views.UserRegistrarionView.as_view(), name='user-register'),
    path('api/main/login/', views.LoginAPIView.as_view(), name='user-login'),
]



