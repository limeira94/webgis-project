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
    # path('geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('project/<int:pk>/', views.ProjectGetList.as_view(), name='get-project'),
    path('projects/', views.ProjectList.as_view(), name='get_projects'),
    path('projects/<int:pk>/', views.ProjectList.as_view(), name='delete-project'),
    path("raster/change-visual/<int:pk>/",views.RasterVisualization.as_view(),name="raster-visual"),
    # path('upload_geojson/', views.GeoJSONUploadView.as_view(), name='upload-geojson'),
    # path('upload_shapefile/', views.ShapefileUploadView.as_view(), name='upload-shapefile'),    
    path("vectors/<int:pk>/save-style/",views.UpdateVectorStyle.as_view(),name="update-style-vector"),
    path("vectors/<int:pk>/save-style-cat/",views.UpdateCategorizedStyle.as_view(),name="update-style-vector"),
    path('download/<int:vector_file_id>/', views.DownloadGeoJSONView.as_view(), name='download_geojson'),
    path('download-selected/<int:vector_file_id>/', views.DownloadSelectedGeoJSONView.as_view(), name='download_selected_geojson'),
    path('update-project-thumbnail/<int:project_id>/', views.UpdateProjectThumbnailView.as_view(), name='update-project-thumbnail'),
    path('convert-geopackage/', views.ConvertGeoPackageToGeoJSONView.as_view(), name='convert_geopackage_to_geojson'),
]
