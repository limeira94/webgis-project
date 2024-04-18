from django.contrib.auth import views as auth_views
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from . import views

app_name = 'users'

urlpatterns = [

    # Rotas de autenticação
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('register/', views.RegisterView.as_view()),
    path('me/', views.RetrieveUserView.as_view()),
    path('update/', views.UserUpdateView.as_view()),
    path('delete/<int:pk>/', views.UserDeleteView.as_view(), name='user-delete'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'),name='password_reset_confirm'),
    path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'),name='password_reset_complete'),
]