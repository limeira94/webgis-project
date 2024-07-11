from django.contrib.auth.models import User
from rest_framework import serializers

from .models import *


class GeoJsonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoJSONFile
        fields = "__all__"#('id', 'name', 'geojson', 'attributes', 'group_id')


class RasterFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RasterFile
        fields = ('id', 'name', 'user', 'raster',"tiles","png","bands")

        validators = [
            FileExtensionValidator(allowed_extensions=['tif', 'tiff']),
            validate_file_size
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        if request and request.method == 'GET':
            # if instance.png.name!='':
            #     data['png'] = instance.png
            if instance.tiles != '':
                data['tiles'] = instance.tiles

        return data


class ProjectSerializer(serializers.ModelSerializer):
    # raster = RasterFileSerializer(many=True, read_only=True)
    # geojson = GeoJsonFileSerializer(many=True, read_only=True)
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        # fields = '__all__'
        exclude = ("geojson","raster")

    def get_created_at(self, obj):
        return obj.get_create_at()

    def get_updated_at(self, obj):
        return obj.get_updated_at()
    
    def create(self, validated_data):
        name = validated_data['name']
        user = validated_data['user']

        project = Project.objects.create(name=name, user=user)
        return project



class ProjectPkSerializer(serializers.ModelSerializer):
    raster = RasterFileSerializer(many=True, read_only=True)
    geojson = GeoJsonFileSerializer(many=True, read_only=True)
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'

    def get_created_at(self, obj):
        return obj.get_create_at()

    def get_updated_at(self, obj):
        return obj.get_updated_at()
    
    def create(self, validated_data):
        name = validated_data['name']
        user = validated_data['user']

        project = Project.objects.create(name=name, user=user)
        return project