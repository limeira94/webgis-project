from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GeoJSONFile,RasterFile


class GeoJsonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoJSONFile
        fields = ('id', 'name', 'geojson')

class RasterFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RasterFile
        fields = ('id', 'name', 'raster')

class UserRegister(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user