from django.db import models
from django.conf import settings
from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
import time
import datetime
import os
import requests
from PIL import Image
import tifffile as tiff
from osgeo import gdal,osr
from shapely.geometry import Polygon
from shapely.ops import transform
import pyproj
from django.core.files import File
import numpy as np
import io

from .geoserver import upload_file

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
    #user = models.ForeignKey(User)
    geojson = models.GeometryField()

    #TODO:
    # Banco de dados unico para cada usuário.


class GeoserverData(models.Model):
    url = models.CharField(max_length=300)
    workspace = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    epsg=models.IntegerField()

def normalize_ar(ar):
    # pct = 0.99
    # sorted_ar = np.sort(ar.flatten())
    # n = int(len(sorted_ar)*pct)
    # ar_max = sorted_ar[n]
    # print(ar.min(),ar.max(),ar_max)
    # img_max = np.percentile(ar, 99)     #ar.max()
    # print(img_max)
    print(ar.shape)
    array = (ar-ar.min())/(ar.max()-ar.min())
    ar[ar>1]=1
    ar[ar<0]=0
    array = array*255
    array = array.astype(np.uint8)
    return array

def get_bounds(file):
    ds = gdal.Open(file)
    xmin, xpixel, _, ymax, _, ypixel = ds.GetGeoTransform()
    width, height = ds.RasterXSize, ds.RasterYSize
    xmax = xmin + width * xpixel
    ymin = ymax + height * ypixel
    poly = Polygon(
            [
                [xmin,ymax],
                [xmax,ymax],
                [xmax,ymin],
                [xmin,ymin]
            ]
        )
    proj = osr.SpatialReference(wkt=ds.GetProjection())
    epsg = proj.GetAttrValue('AUTHORITY',1)
    if int(epsg)!=4326:

        wgs84 = pyproj.CRS('EPSG:4326')
        utm = ds.GetProjection()

        project = pyproj.Transformer.from_crs(utm, wgs84,  always_xy=True).transform
        poly = transform(project, poly)
    
    return poly.bounds


class Project(models.Model):
    name = models.CharField(max_length=100)
    vector = models.ManyToManyField(GeoJSONFile)



class RasterFile(models.Model):
    name = models.CharField(max_length=100)
    raster = models.FileField(upload_to='rasters/', validators=[validate_file_extension])
    tiles = models.CharField(max_length=300,default='',null=True,blank=True)
    # wms = models.CharField(max_length=300,default='',null=True,blank=True)

    def __str__(self):
        return self.name

    #TODO:
    # Solve problem with render raster
    # Options:
    # Create tiles using gdal2tiles
    # Use Geoserver 
    # Convert to PNG
    # Other....
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # # To create zoom levels
        # N = 18
        
        if self.tiles=="":
            ###############
            ###     PNG
            # name=self.raster.url
            # file = self.raster.storage.path(name=name.replace('/media/',''))#
            #TODO: 
            # solve this problem with the file.
            site = 'https://webgis.site'
            if os.environ.get("LOCAL")=="True":
                site = 'http://127.0.0.1:8000'
            file = site+self.raster.url

            bounds = get_bounds(file)

            resp = requests.get(file)
            img = tiff.imread(io.BytesIO(resp.content))

            # TODO:
            ### Create the way to select the bands to use and way to stretch for better visual
            try:
                r = Image.fromarray(normalize_ar(img[:,:,0]))
                g = Image.fromarray(normalize_ar(img[:,:,1]))
                b = Image.fromarray(normalize_ar(img[:,:,2]))
                im1 = Image.merge( 'RGB', (r, g, b))
            except IndexError as e:
                # print(e)
                # print(img.shape)
                ar = normalize_ar(img)
                im1 = Image.fromarray(ar)


            with io.BytesIO() as buffer:
                im1.save(buffer, format="PNG")
                image_data = buffer.getvalue()

            filename = self.raster.url.replace('.tif','.png')[1:]

            self.tiles = ','.join([str(i) for i in bounds])
            self.raster.save(filename, File(io.BytesIO(image_data)))


            # ##############
            # ###   GEOSERVER
            # upload_file(file)
            # url = settings.GEOSERVER['URL']
            # workspace = settings.GEOSERVER['WORKSPACE']
            # name = os.path.basename(file).split('.')[0]
            # epsg=4236
            # # self.tiles=f'url={url}{workspace}/wms&format=image/png&layers={name}&styles=&crs=EPSG:{epsg}'
            # self.tiles=f'{url}{workspace}/wms&format=image/png&layers={name}&styles=&crs=EPSG:{epsg}'
            # self.save()


            #############
            ##  TILES

            #
            # bn = os.path.basename(file).replace(".tif","")
            
            # output = f'media/tiles/{bn}'
            # if not os.path.exists(output):
            #     os.makedirs(output)

            # temp = os.path.join(output,os.path.basename(output)+'.tif')

            # # w = f'gdalwarp -t_srs EPSG:4326 http://127.0.0.1:8000{file} {temp}'
            # w = f'gdalwarp -t_srs EPSG:4326 {file} {temp}'
            # print(w)
            # os.system(w)

            # temp_vrt = temp.replace('.tif','.vrt')
            # # c = f'gdal_translate -of VRT -ot Byte -scale http://127.0.0.1:8000{file} {temp}'
            # c = f'gdal_translate -of VRT -ot Byte -scale {temp} {temp_vrt}'
            # os.system(c)

            # f = f'gdal2tiles.py {temp_vrt} {output} -z "1-{N}" '
            # os.system(f)
            
            # self.tiles = output
            # self.save()
            # d = str(datetime.timedelta(seconds=time.time()-t1))
            # print("#"*50)
            # print(f"TIME TO PROCESS {N} tiles: {d}")
            # print("#"*50)

        
# #### FUTURE IMPROVEMENTS
# #TODO?:
# # Create the way to allow users to create a VIEW, selecting bands 
# # for example, this option of selecting bands works with geoserver.
# class RasterView(models.Model):
#     raster = models.ForeignKey(RasterFile,on_delete=models.CASCADE)



        



