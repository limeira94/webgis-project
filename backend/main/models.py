import io
import os
import time

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.humanize.templatetags.humanize import naturaltime
from django.core.files import File
from django.db.models import JSONField
from django.core.validators import FileExtensionValidator

from PIL import Image

from .utils import *


#TODO: 
#Adicionar o arquivo que foi feito o upload de repente.
# models.FileField()
# É bom que podemos agrupar os dados baseado nisso, ao invés do "group_id"
# Da pra fazer um model novo tipo esse:

def get_default_style():
    return {
        "color": "#01579b",
        "weight": 1,
        "fillOpacity": 1.0,
        "fillColor": "#00ff55"
        # "color": "#ff7800",
        # "weight": 3,
        # "fillOpacity": 0.65,
        # "fillColor": "#ff7800"
    }

STYLE_TYPES = [
    ("A","All"),
    ("C","Categorized"),
    # ("G","Graduated"),
]


class Geojson(models.Model):
    geometry = models.GeometryField()
    attributes = JSONField(blank=True, null=True)
    # vector = models.ForeignKey(VectorFileModel,on_delete=models.CASCADE)
    # style = models.JSONField(default=get_default_style)
    style = models.JSONField(default=get_default_style)

class VectorFileModel(models.Model):
    file = models.FileField(upload_to="",blank=True,null=True)
    format_name = models.CharField(max_length=20,blank=True,null=True)
    name = models.CharField(max_length=100)#,unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    style = models.JSONField(default=get_default_style)
    style_type = models.CharField(choices=STYLE_TYPES,default="A")
    geoms = models.ManyToManyField(Geojson)

    # def save(self, *args, **kwargs):
    #     NAME = self.file.name
    #     super().save(*args, **kwargs)
    #     self.name = os.path.splitext(NAME)[0]
        

# class GeoJSONFile(models.Model):
#     name = models.CharField(max_length=255)
#     user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
#     geojson = models.GeometryField()
#     attributes = JSONField(blank=True, null=True)
#     group_id = models.IntegerField(default=0)
#     style = models.JSONField(default=get_default_style)

#TODO: 
# Substituir overwrite do save
# colocar em um view.
class RasterFile(models.Model):
    name = models.CharField(max_length=100)
    raster = models.FileField(validators=[FileExtensionValidator(allowed_extensions=['tif', 'tiff']),validate_file_size])
    png = models.FileField(upload_to=generate_upload_path_raster,blank=True,null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    tiles = models.CharField(max_length=300, default='', null=True, blank=True)
    bands = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    
    @property
    def get_bands(self):
        return gdal.Open(self.raster.url).RasterCount

    def save(self, *args, **kwargs):
        NAME = self.raster.name
        super().save(*args, **kwargs)
        
        if self.bands==0:
            file = self.raster.url
            n = gdal.Open(file).RasterCount
            self.bands = n
            self.save()

        if self.tiles == '':
            t1 = time.time()
            
            if self.raster.url.find("s3")!=-1:
                file = self.raster.url
            else:
                site = 'https://webgis.site'
                if os.environ.get('LOCAL') == 'True':
                    site = 'http://127.0.0.1:8000'
                file = site + self.raster.url

            try:
                bounds = get_bounds(file)
            except:
                raise ValidationError("There is a problem with the provided file.")

            img = gdal.Open(file).ReadAsArray()

            try:

                r = Image.fromarray(normalize_ar(img[0,:, :]))
                g = Image.fromarray(normalize_ar(img[1,:, :]))
                b = Image.fromarray(normalize_ar(img[2,:, :]))
                
                im1 = Image.merge('RGB', (r, g, b))
            except IndexError as e:
                ar = normalize_ar(img)
                im1 = Image.fromarray(ar)

            with io.BytesIO() as buffer:
                im1.save(buffer, format='PNG')
                image_data = buffer.getvalue()

            filename = NAME.replace('.tif', '.png')[1:]

            self.tiles = ','.join([str(i) for i in bounds])
            self.png.save(filename, File(io.BytesIO(image_data)))

            print(round(time.time()-t1,2))

class RasterVisual(models.Model):
    url = models.CharField(max_length=50)
    # raster_id = models.ForeignKey(RasterFile,on_delete=models.CASCADE)
    raster = models.OneToOneField(RasterFile,on_delete=models.CASCADE)
    png = models.FileField(upload_to=generate_upload_path_raster,)



class Project(models.Model):
    name = models.CharField(max_length=100)
    thumbnail = models.ImageField(null=True, blank=True)
    vector = models.ManyToManyField(VectorFileModel, blank=True)
    # geojson = models.ManyToManyField(GeoJSONFile, blank=True)
    raster = models.ManyToManyField(RasterFile, blank=True)
    public = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name + f"_id={self.pk}"

    def get_create_at(self):
        return naturaltime(self.created_at)

    def get_updated_at(self):
        return naturaltime(self.updated_at)