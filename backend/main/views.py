from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from django.contrib.gis.geos import GEOSGeometry
from django.http import Http404

from rest_framework.parsers import MultiPartParser, FormParser
import json
from .models import GeoJSONFile

from .utils import get_geojson_bounds
from django.contrib.auth.models import User
from .serializers import UserRegister, GeoJsonFileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


class HomePageView(APIView):
    def get(self, request):
        return Response({"message": "Hello, world!"}, status=status.HTTP_200_OK)
    

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

            firts_geometry = geojson_data['features'][0]['geometry']
            bounds = get_geojson_bounds(firts_geometry)
            for feature in geojson_data['features']:
                geometry = GEOSGeometry(json.dumps(feature['geometry']))
                name = request.data.get('name', 'Unnamed')
                
                geo_instance = GeoJSONFile(name=name, geojson=geometry)
                geo_instance.save()

                return Response({
                    "message": "Data saved successfully",
                    "bounds": bounds
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
        
