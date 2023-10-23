from django.urls import path
from django.shortcuts import render
from django.urls import path,include
from django.views.generic import TemplateView
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register('rasters',views.RasterViewSet,basename='rasters')

urlpatterns = [
    path('api/main/',include(router.urls)),
    path('api/main/upload/', views.GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
    path('api/main/geojson/<int:pk>/', views.GeoJSONDetailView.as_view(), name='get_geojson'),
    path('api/main/geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('api/main/register/', views.UserRegistrarionView.as_view(), name='user-register'),
    path('api/main/login/', views.LoginAPIView.as_view(), name='user-login'),
    # path("api/main/rasters/",raster_detail,name='rasters'),
    path('', TemplateView.as_view(template_name='index.html')), 
    path('map', TemplateView.as_view(template_name='index.html')),
]

        

