from django.db import models
from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
import os

def validate_file_extension(value):    
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.tif']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension.')
    
class Shapefile(models.Model):
    name = models.CharField(max_length=100)
    shapefile = models.FileField(upload_to='shapefiles/')
    
    
class GeoJSONFile(models.Model):
    name = models.CharField(max_length=255)
    geojson = models.GeometryField()
    

class RasterFile(models.Model):
    name = models.CharField(max_length=100)
    raster = models.FileField(upload_to='rasters/', validators=[validate_file_extension])

