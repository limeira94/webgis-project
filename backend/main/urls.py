from django.urls import path
from django.shortcuts import render
from django.urls import path,include
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenRefreshView,TokenVerifyView
from rest_framework import routers
from . import views

app_name = "main"
#TODO:
# IF NEEDED:
# change all routes to be used inside the router
router = routers.DefaultRouter()
router.register('rasters',views.RasterViewSet,basename='rasters')
# router.register('delete_all_rasters', views.DeleteAllRasterViewSet, basename='delete_all_rasters')
# router.register('rasters/delete_all', views.DeleteAllRasterViewSet, basename='delete_all_rasters')
# router.register('upload',views.GeoJSONFileUploadAPIView.as_view(),basename='upload_geojson_api')

urlpatterns = [
    path('api/main/',include(router.urls)),
    path('api/main/upload/', views.GeoJSONFileUploadAPIView.as_view(), name='upload_geojson_api'),
    path('api/main/geojson/<int:pk>/', views.GeoJSONDetailView.as_view(), name='get_geojson'),
    path('api/main/geojson/', views.GeoJSONListView.as_view(), name='get_all_geojson'),
    path('api/main/register/', views.UserRegistrarionView.as_view(), name='user-register'),
    path('api/main/login/', views.LoginAPIView.as_view(), name='user-login'),

    path('api/main/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/main/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/main/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('api/users/register/', views.RegisterView.as_view()),
    path('api/users/me/', views.RetrieveUserView.as_view()),
    path('api/users/update/', views.UserUpdateView.as_view()),
    path('api/users/delete/<int:pk>/', views.UserDeleteView.as_view(), name='user-delete'),
    path('api/users/reset-password/',views.ResetPasswordView.as_view(),name='reset-password'),

    path('api/users/password-reset-confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             template_name='password_reset_confirm.html'),
            name='password_reset_confirm'),
            
    path('api/users/password-reset-complete/',
         auth_views.PasswordResetCompleteView.as_view(
             template_name='password_reset_complete.html'),
             name='password_reset_complete'),


    # path("api/main/rasters/",raster_detail,name='rasters'),
    path('', TemplateView.as_view(template_name='index.html')), 
    path('map', TemplateView.as_view(template_name='index.html')),
    path('login/', TemplateView.as_view(template_name='index.html'), name='login'),
    # path('api/main/register/', views.UserRegistrarionView.as_view(), name='user-register'),
    # path('api/main/login/', views.LoginAPIView.as_view(), name='user-login'),
    # path('login/', views.DjangoLoginView.as_view(), name='django-login'),
    # path('register/', views.DjangoRegisterView.as_view(), name='django-register'),
    # path('logout/', views.DjangoLogoutView.as_view(), name='django-logout'),
]

        

