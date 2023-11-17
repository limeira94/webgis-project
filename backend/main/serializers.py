from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GeoJSONFile,RasterFile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
       data = super().validate(attrs)
       refresh = self.get_token(self.user)
       data['refresh'] = str(refresh)
       data['access'] = str(refresh.access_token)
       return data


class GeoJsonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoJSONFile
        fields = ('id', 'name', 'geojson')

class RasterFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RasterFile
        fields = ('id', 'name',"user", 'raster')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        if request and request.method == 'GET':
            # if instance.png.name!='':
            #     data['png'] = instance.png  
            if instance.tiles!='':
                data['tiles'] = instance.tiles    
        
        return data

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