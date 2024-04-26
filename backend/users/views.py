from django.shortcuts import render
from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.views import LoginView
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.shortcuts import redirect, render
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status, viewsets, views
import sys

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .serializers import *

class ResetPasswordView(APIView):
    queryset = User.objects.all()

    def post(self, request):
        to_email = request.data.get('email')
        if not to_email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=to_email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        current_site = get_current_site(request)

        mail_subject = 'Change your password'
        message = render_to_string(
            'changepassword.html',
            {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': PasswordResetTokenGenerator().make_token(user),
            },
        )

        email = EmailMessage(mail_subject, message, to=[to_email])
        email.send()
        messages.info(
            request,
            'Please confirm your email address to complete the registration',
        )
        return redirect('/')

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.user == instance:
            self.perform_destroy(instance)
            return Response(status=204)
        else:
            return Response(
                {'detail': 'You do not have permission to delete this user.'},
                status=403,
            )


class UserUpdateView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            token = request.auth
            payload = token.payload
            user_id = payload['user_id']
        except (InvalidToken, KeyError):
            return Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user_id != request.user.id:
            return Response(
                {'detail': 'Token user does not match update user.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = UserSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    def post(self, request):
        print("A")
        serializer = RegisterSerializer(data=request.data)
        # TODO:
        ### Colocar um jeito de verificar erro
        ### Verificar questão de senha e email atualmente não aceitar email com . e senha curtas

        if not serializer.is_valid():
            print("ERROR",serializer.errors)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        if serializer.validated_data['password'] != request.data['password2']:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=request.data['username']).exists():
            return Response(
                {'error': 'Username is already taken'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=request.data['email']).exists():
            return Response(
                {'error': 'Email is already in use'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        return Response(
            RegisterSerializer(user).data, status=status.HTTP_201_CREATED
        )
    

class RetrieveUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            headers = request.headers
            user = request.user
            user_serializer = UserSerializer(user)
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            
            error_message = {
                "error": str(e),
                "info":{
                    "headers":headers,
                    "user":user,
                }
                }
            return Response(error_message, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    
        # # Print request headers
        # print("Request Headers:", headers)
        # try:
        #     info["step1"] = f"OK -> {request.headers}"
        #     user = request.user
        #     info["step2"] = f"OK-> USER: {user}"
        #     print("#"*199)
        #     user_serializer = UserSerializer(user)
        #     print("2"*199)
        #     info["step3"] = f"OK-> Serializer: {user_serializer}"
        #     print("3"*199)
        #     info["step4"] = f"OK -> DATA> {user_serializer.data}"
        #     print("4"*199)
        #     return Response(user_serializer.data, status=status.HTTP_200_OK)
        # except Exception as e:
        #     error_message = {"error": str(e),"info":info}
        #     return Response(error_message, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrarionView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegister

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'detail': 'User not found or wrong password'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response(
            {'access_token': access_token}, status=status.HTTP_200_OK
        )
    

