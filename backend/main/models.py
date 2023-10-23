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
    png = models.FileField(upload_to='rasters/',blank=True,null=True)
    bounds = models.CharField(max_length=300,default='',null=True,blank=True)

    #TODO:
    # Solve problem with render raster
    # Options:
    # Create tiles using gdal2tiles
    # Use Geoserver 
    # Other....
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        file = self.raster.url.replace('media/','/media/rasters/')
        temp = os.path.basename(file).replace('.tif','.vrt')
        output = f'temp/{temp.replace(".vrt","")}'
        url = ''

        c = f'gdal_translate -of VRT -ot Byte -scale http://127.0.0.1:8000{file} {temp}'
        print(c)
        os.system(c)
        f = f'gdal2tiles.py {temp} {output}'
        os.system(f)
        print(f)
        super().save(*args, **kwargs)

        


