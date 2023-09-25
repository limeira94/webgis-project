from django.urls import path
from .views import HomePageView, LoginAPIView, GeoJSONFileUploadAPIView, UserRegistrarionView


urlpatterns = [
    path('', HomePageView.as_view(), name='homepage'),
    path('upload-api/', GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
    path('register/', UserRegistrarionView.as_view(), name='user-register'),
    path('login/', LoginAPIView.as_view(), name='user-login'),
]



