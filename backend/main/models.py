from django.db import models
from django.contrib.gis.db import models

# Create your models here.

class Shapefile(models.Model):
    name = models.CharField(max_length=100)
    shapefile = models.FileField(upload_to='shapefiles/')
    
    
class GeoJSONFile(models.Model):
    name = models.CharField(max_length=255)
    geojson = models.PointField()
    