from django.urls import include, path
from rest_framework import routers
from . import views

app_name = 'main'

router = routers.DefaultRouter()
router.register('rasters', views.RasterViewSet, basename='rasters')
router.register('upload', views.GeoJSONFileUploadViewSet, basename='upload_geojson_api')
router.register('upload_draw', views.LeafletDrawUploadViewSet, basename='upload_draw_api')

urlpatterns = [
    path('', include(router.urls)),
    
    path('geojson/<int:pk>/', views.GeoJSONDetailView.as_view(), name='get_geojson'),
    path('geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('project/<int:pk>/', views.ProjectGetList.as_view(), name='get-project'),
    path('projects/', views.ProjectList.as_view(), name='get_projects'),
    path('projects/<int:pk>/', views.ProjectList.as_view(), name='delete-project'),
    path("raster/change-visual/<int:pk>",views.RasterVisualization.as_view(),name="raster-visual"),
    # path('upload_geojson/', views.GeoJSONUploadView.as_view(), name='upload-geojson'),
    # path('upload_shapefile/', views.ShapefileUploadView.as_view(), name='upload-shapefile'),    
]
