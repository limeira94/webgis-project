from django.urls import path
from .views import HomePageView, GeoJSONFileAPIView, UploadGeoJSONFileView, GeoJSONFileUploadAPIView
from . import views

urlpatterns = [
    path('', HomePageView.as_view(), name='homepage'),
    path('test/', views.test_view, name='test_view'),
    path('geojson/<int:file_id>/', GeoJSONFileAPIView.as_view(), name='geojson_file'),
    path('geojson/', views.serve_geojson, name='serve_geojson'),
    path('upload/', UploadGeoJSONFileView.as_view(), name='upload_geojson'),
    path('upload-api/', GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
]



