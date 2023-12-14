import json

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.views import LoginView
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.db import connection
from django.db.models import Q
from django.db.utils import ProgrammingError
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .models import GeoJSONFile, Project, RasterFile, Vector
from .serializers import *


class ProjectList(APIView):


    def post(self, request):

        if request.user.is_authenticated:
            data = request.data
            data["user"] = request.user.pk
            serializer = ProjectSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Authentication credentials were not provided.'},status=status.HTTP_401_UNAUTHORIZED)


    def get(self, request):
        if request.user.is_authenticated:
            projects = Project.objects.filter(user=request.user)
        else:
            projects = Project.objects.filter(public=True)

        project_serializer = ProjectSerializer(projects, many=True)
        return Response(project_serializer.data, status=status.HTTP_200_OK)


class VectorList(APIView):
    queryset = Vector.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        vectors = Vector.objects.filter(user=request.user)
        vectors = VectorSerializer(vectors, many=True)
        return Response(vectors.data, status=status.HTTP_200_OK)


class VectorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vector.objects.all()
    serializer_class = VectorSerializer


class ExportGeoJSON(APIView):
    def get(self, request, *args, **kwargs):
        vectors = Vector.objects.filter(user=request.user)

        geojson_data = self.serialize_as_geojson(vectors)
        vectors = VectorSerializer(geojson_data, many=True)
        return Response(geojson_data, status=status.HTTP_200_OK)
        # response = HttpResponse(geojson_data, content_type='application/json')
        # response['Content-Disposition'] = f'attachment; filename="{self.filename.replace(self.format,".geojson")}"'
        # return response

    def get_command(self, table):
        print(table)
        return f"""
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(ST_AsGeoJSON(t.*)::json)
            )
        FROM "{table.lower().replace("-","_")}" as t;
        """

    def run_command(self, command):
        with connection.cursor() as cursor:
            cursor.execute(command)
            result = cursor.fetchone()[0]
        return result

    def serialize_as_geojson(self, vectors, many=True):
        if many:
            features = []
            for vector in vectors:
                table = vector.dbname
                data = self.run_command(self.get_command(table))
                # try:
                #     data = self.run_command(self.get_command(table))
                # except ProgrammingError:
                #     pass
                # else:
                features.append(data)
            return features
        else:
            return self.run_command(self.get_command(vectors))


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
                'domain': current_site.domain,  #'127.0.0.1:8000',#
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
        serializer = RegisterSerializer(data=request.data)
        # TODO:
        ### Colocar um jeito de verificar erro
        ### Verificar questão de senha e email atualmente não aceitar email com . e senha curtas

        if not serializer.is_valid():
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
    #   permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user = UserSerializer(user)

        return Response(user.data, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class DjangoLoginView(LoginView):
    template_name = 'login.html'
    form_class = AuthenticationForm

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, {})

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class RasterViewSet(viewsets.ModelViewSet):
    queryset = RasterFile.objects.all()
    serializer_class = RasterFileSerializer

    @action(
        methods=['DELETE'],
        detail=False,
    )
    def delete(self, request: Request):
        delete_rasters = self.queryset.all()
        delete_rasters.delete()
        return Response(self.serializer_class(delete_rasters, many=True).data)


class GeoJSONDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            geojson_file = GeoJSONFile.objects.get(pk=pk)
            serializer = GeoJsonFileSerializer(geojson_file)
            return Response(serializer.data)
        except GeoJSONFile.DoesNotExist:
            return Response(
                {'error': 'GeoJSON file not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request, pk):
        try:
            geojson_file = GeoJSONFile.objects.get(pk=pk)
            geojson_file.delete()
            return Response(
                {'message': 'GeoJSON file deleted successfully'},
                status=status.HTTP_204_NO_CONTENT,
            )
        except GeoJSONFile.DoesNotExist:
            return Response(
                {'error': 'GeoJSON file not found'},
                status=status.HTTP_404_NOT_FOUND,
            )


class GeoJSONListView(APIView):
    def get(self, request):
        geojson_files = GeoJSONFile.objects.all()
        serializer = GeoJsonFileSerializer(geojson_files, many=True)
        return Response(serializer.data)

    def delete(self, request):
        print('DELETING')
        GeoJSONFile.objects.all().delete()
        return Response(
            {'message': 'All GeoJSON files deleted successfully'},
            status=status.HTTP_204_NO_CONTENT,
        )


class GeoJSONFileUploadViewSet(viewsets.ViewSet):
    def create(self, request):
        try:
            geojson_data = json.loads(request.data['geojson'].read())

            if not isinstance(geojson_data.get('features'), list):
                raise ValueError('Invalid GeoJSON format')

            save_instance = []
            bounds = []
            for feature in geojson_data['features']:
                geometry = GEOSGeometry(json.dumps(feature['geometry']))
                name = feature.get('properties', {}).get('name', 'Unnamed')
                # name = request.data.get('name', 'Unnamed')
                # TODO:
                # Here Im providing a default user but later we will need to check authentication
                user = request.data.get('user', '4')
                # TODO:
                # Verificar se o usuário existe, coloquei esse except só para não dar erro
                try:
                    user = User.objects.get(pk=user)
                except User.DoesNotExist:
                    user = None
                geo_instance = GeoJSONFile(
                    name=name, user=user, geojson=geometry
                )
                geo_instance.save()

                bounds.append(geometry.extent)

                save_instance.append(
                    {
                        'id': geo_instance.id,
                        'name': geo_instance.name,
                        'geojson': json.loads(geo_instance.geojson.geojson),
                    }
                )
            return Response(
                {
                    'message': 'Data saved successfully',
                    'bounds': bounds,
                    'savedGeoJsons': save_instance,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
            

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
