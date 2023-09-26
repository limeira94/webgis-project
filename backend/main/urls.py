from django.urls import path
from . import views
# from .views import HomePageView, LoginAPIView, GeoJSONFileUploadAPIView, UserRegistrarionView


urlpatterns = [
    path('', views.HomePageView.as_view(), name='homepage'),
    path('upload-api/', views.GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
    path('api/geojson/<int:pk>/', views.GeoJSONDetailView.as_view(), name='get_geojson'),
    path('api/geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('register/', views.UserRegistrarionView.as_view(), name='user-register'),
    path('login/', views.LoginAPIView.as_view(), name='user-login'),
]



