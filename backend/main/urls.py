from django.urls import path
from . import views
# from .views import HomePageView, LoginAPIView, GeoJSONFileUploadAPIView, UserRegistrarionView


urlpatterns = [
    path('', views.HomePageView.as_view(), name='homepage'),
    path('api/main/upload/', views.GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
    path('api/main/geojson/<int:pk>/', views.GeoJSONDetailView.as_view(), name='get_geojson'),
    path('api/main/geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('api/main/register/', views.UserRegistrarionView.as_view(), name='user-register'),
    path('api/main/login/', views.LoginAPIView.as_view(), name='user-login'),
]



