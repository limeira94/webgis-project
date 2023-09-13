import os
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.gis.geos import GEOSGeometry

from rest_framework.parsers import MultiPartParser, FormParser
import json
from .models import GeoJSONFile
from django.http import HttpResponse
from django.http import JsonResponse, HttpResponseBadRequest
from .forms import GeoJSONFileForm
from django.shortcuts import render, redirect

class HomePageView(APIView):
    def get(self, request):
        return Response({"message": "Hello, world!"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def upload_geojson(request):
    if request.methos == 'POST':
        
        geojson_file = request.FILES['geojson']

        return Response({'message': "Geojson uploaded successfully"})
    

@api_view(['POST'])
def serve_geojson(request, geojson_id):
    geojson_obj = GeoJSONFile.objects.get(pk=geojson_id)
    

def test_view(request):
    return HttpResponse("Teste bem-sucedido!")


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")
             
                        
class GeoJSONFileAPIView(APIView):
    def get(self, request, file_id):
        try:
            geojson_file = GeoJSONFile.objects.get(id=file_id)
        except GeoJSONFile.DoesNotExist:
            return HttpResponseBadRequest("GeoJSON file does not exist")
        
        with open(geojson_file.geojson.path, 'r') as f:
            data = json.load(f)
            
        return JsonResponse(data)
    
    
def serve_geojson(request):
    file_path = os.path.join(os.path.dirname(__file__), '../data/sao_paulo.geojson')
    
    with open(file_path, 'r') as file:
        data = json.load(file)
        
    return JsonResponse(data)


class UploadGeoJSONFileView(APIView):
    def post(self, request):
        form = GeoJSONFileForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return Response({'message': 'GeoJSON file uploaded successfully'}, status=201)
        return Response({'errors': form.errors}, status=400)
    
    def get(self, request):
        form = GeoJSONFileForm()
        return render(request, 'upload.html', {'form': form})
    
    
class GeoJSONFileUploadAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        
        try:
            geojson_data = json.loads(request.data['geojson'].read())

            if not isinstance(geojson_data.get('features'), list):
                raise ValueError('Invalid GeoJSON format')
        
            for feature in geojson_data['features']:
                geometry = GEOSGeometry(json.dumps(feature['geometry']))
                name = request.data.get('name', 'Unnamed')
                
                geo_instance = GeoJSONFile(name=name, geojson=geometry)
                geo_instance.save()

                return Response({"message": "Data saved successfully"}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)