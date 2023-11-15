from django.contrib.gis.geos import GEOSGeometry
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.http import Http404
from django.contrib.auth.forms import AuthenticationForm

from rest_framework import viewsets
from rest_framework import status, generics
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.request import Request

from rest_framework_simplejwt.tokens import RefreshToken

import json

from .models import GeoJSONFile,RasterFile
from .utils import get_geojson_bounds
from .serializers import UserRegister, GeoJsonFileSerializer,RasterFileSerializer


from django.contrib.auth.views import LoginView
from django.shortcuts import render

class DjangoLoginView(LoginView):
    template_name = 'login.html' 
    form_class = AuthenticationForm
    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, {})

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class HomePageView(APIView):
    def get(self, request):
        return Response({"message": "Hello, world!"}, status=status.HTTP_200_OK)
    

class RasterViewSet(viewsets.ModelViewSet):
    queryset = RasterFile.objects.all()
    serializer_class = RasterFileSerializer

    @action(methods=["DELETE"], detail =False, )
    def delete(self,request:Request):
        delete_rasters = self.queryset.all()
        delete_rasters.delete()
        return Response( self.serializer_class(delete_rasters,many=True).data)

class GeoJSONDetailView(APIView):
    def get(self, request, pk):
        try:
            geojson_file = GeoJSONFile.objects.get(pk=pk)
            serializer = GeoJsonFileSerializer(geojson_file)
            return Response(serializer.data)
        except GeoJSONFile.DoesNotExist:
            return Response({'error': 'GeoJSON file not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):
        try:
            geojson_file = GeoJSONFile.objects.get(pk=pk)
            geojson_file.delete()
            return Response({'message': 'GeoJSON file deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except GeoJSONFile.DoesNotExist:
            return Response({'error': 'GeoJSON file not found'}, status=status.HTTP_404_NOT_FOUND)        

class GeoJSONListView(APIView):
    def get(self, request):
        geojson_files = GeoJSONFile.objects.all()
        serializer = GeoJsonFileSerializer(geojson_files, many=True)
        return Response(serializer.data)
    

    def delete(self, request):
        GeoJSONFile.objects.all().delete()
        return Response({'message': 'All GeoJSON files deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
class GeoJSONFileUploadAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        try:   
            geojson_data = json.loads(request.data['geojson'].read())

            if not isinstance(geojson_data.get('features'), list):
                raise ValueError('Invalid GeoJSON format')

            #TODO:
            # Aqui ele está apenas pegando a primeira geometria, precisamos 
            # por ler todas elas
            firts_geometry = geojson_data['features'][0]['geometry']
            bounds = get_geojson_bounds(firts_geometry)
            
            save_instance = []
            
            for feature in geojson_data['features']:
                geometry = GEOSGeometry(json.dumps(feature['geometry']))
                name = request.data.get('name', 'Unnamed')
                
                geo_instance = GeoJSONFile(name=name, geojson=geometry)
                geo_instance.save()
                
                save_instance.append({
                    'id': geo_instance.id,
                    'name': geo_instance.name,
                    'geojson': json.loads(geo_instance.geojson.geojson)
                })
                    
                return Response({
                    "message": "Data saved successfully",
                    "bounds": bounds,
                    "savedGeoJsons": save_instance
                }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
            return Response({'detail': 'User not found or wrong password'}, status=status.HTTP_401_UNAUTHORIZED)
            
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response({'access_token': access_token}, status=status.HTTP_200_OK)
        
