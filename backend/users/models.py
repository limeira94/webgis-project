from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.db.models import Sum, Func, F
from django.db.models.functions import Length

import os

from main.models import RasterFile,VectorFileModel,Geojson

def user_directory_path(instance, filename):
    return 'user_{0}/{1}'.format(instance.user.id, filename)

class ST_MemSize(Func):
    function = 'ST_MemSize'
    output_field = models.BigIntegerField() 

def get_geometry_size_for_user(user):
    vector_files = VectorFileModel.objects.filter(user=user)
    geojson_objects = Geojson.objects.filter(vectorfilemodel__in=vector_files)

    geojson_with_size = geojson_objects.annotate(
        geometry_size=ST_MemSize(F('geometry'))
    )

    total_geometry_size = geojson_with_size.aggregate(total_size=Sum('geometry_size'))

    return total_geometry_size['total_size'] or 0


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to=user_directory_path, blank=True, null=True)
    total_raster_usage = models.BigIntegerField(default=0)
    total_vector_usage = models.BigIntegerField(default=0)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    def calculate_total_data_usage(self):
        total_size = 0
        raster_files = RasterFile.objects.filter(user=self.user)
        print(raster_files)

        for raster in raster_files:
            print(raster)
            total_size += raster.raster.size
            # if raster.raster and os.path.exists(raster.raster.path):
                # total_size += os.path.getsize(raster.raster.path)

        return total_size
    
    def update_profile(self):
        self.total_vector_usage = get_geometry_size_for_user(self.user)
        self.total_raster_usage = self.calculate_total_data_usage()
        self.save()

    def save(self, *args, **kwargs):
        # self.update_profile()
        self.total_vector_usage = get_geometry_size_for_user(self.user)
        self.total_raster_usage = self.calculate_total_data_usage()
        super().save(*args, **kwargs)


