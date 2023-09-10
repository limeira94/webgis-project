from rest_framework import serializers
from .models import GeoJSONFile


class GeoJsonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoJSONFile
        fields = ('id', 'name', 'geojson')
        
        