from django.db import models
from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
import time
import datetime
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
    tiles = models.CharField(max_length=300,default='',null=True,blank=True)

    def __str__(self):
        return self.name

    #TODO:
    # Solve problem with render raster
    # Options:
    # Create tiles using gdal2tiles
    # Use Geoserver 
    # Other....
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        N = 18
        
        if self.tiles=="":
            t1 = time.time()
            file = self.raster.url
            bn = os.path.basename(file).replace(".tif","")
            
            output = f'media/tiles/{bn}'
            if not os.path.exists(output):
                os.makedirs(output)

            temp = os.path.join(output,os.path.basename(output)+'.tif')

            # w = f'gdalwarp -t_srs EPSG:4326 http://127.0.0.1:8000{file} {temp}'
            w = f'gdalwarp -t_srs EPSG:4326 .{file} {temp}'
            print(w)
            os.system(w)

            temp_vrt = temp.replace('.tif','.vrt')
            # c = f'gdal_translate -of VRT -ot Byte -scale http://127.0.0.1:8000{file} {temp}'
            c = f'gdal_translate -of VRT -ot Byte -scale {temp} {temp_vrt}'
            os.system(c)

            f = f'gdal2tiles.py {temp_vrt} {output} -z "1-{N}" '
            os.system(f)
            
            self.tiles = output
            self.save()
            d = str(datetime.timedelta(seconds=time.time()-t1))
            print("#"*50)
            print(f"TIME TO PROCESS {N} tiles: {d}")
            print("#"*50)

        

        


