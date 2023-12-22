import io
import os
import subprocess

import requests
import tifffile as tiff
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.humanize.templatetags.humanize import naturaltime
from django.core.files import File

from PIL import Image

from .geoserver import upload_file
from .utils import generate_upload_path, normalize_ar, validate_file_extension, get_bounds


class Shapefile(models.Model):
    name = models.CharField(max_length=100)
    shapefile = models.FileField(upload_to='shapefiles/')


class GeoJSONFile(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True
    )
    geojson = models.GeometryField()

    # TODO:
    # Banco de dados unico para cada usuário.


class GeoserverData(models.Model):
    url = models.CharField(max_length=300)
    workspace = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    epsg = models.IntegerField()


class RasterFile(models.Model):
    name = models.CharField(max_length=100)
    raster = models.FileField(
        upload_to='rasters/', validators=[validate_file_extension]
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True
    )
    tiles = models.CharField(max_length=300, default='', null=True, blank=True)
    # wms = models.CharField(max_length=300,default='',null=True,blank=True)

    def __str__(self):
        return self.name

    # TODO:
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

        if self.tiles == '':
            ###############
            ###     PNG
            # name=self.raster.url
            # file = self.raster.storage.path(name=name.replace('/media/',''))#
            # TODO:
            # solve this problem with the file.
            site = 'https://webgis.site'
            if os.environ.get('LOCAL') == 'True':
                site = 'http://127.0.0.1:8000'
            
            # site = 'http://127.0.0.1:8000'
            # windows = 'C:/Users/limei/Documents/05_VSCode/webgis-project/backend/' + self.raster.url
            
            file = site + self.raster.url
            
            bounds = get_bounds(file)
            
            resp = requests.get(file)
            img = tiff.imread(io.BytesIO(resp.content))

            # TODO:
            ### Create the way to select the bands to use and way to stretch for better visual
            try:
                r = Image.fromarray(normalize_ar(img[:, :, 0]))
                g = Image.fromarray(normalize_ar(img[:, :, 1]))
                b = Image.fromarray(normalize_ar(img[:, :, 2]))
                im1 = Image.merge('RGB', (r, g, b))
            except IndexError as e:
                # print(e)
                # print(img.shape)
                ar = normalize_ar(img)
                im1 = Image.fromarray(ar)

            with io.BytesIO() as buffer:
                im1.save(buffer, format='PNG')
                image_data = buffer.getvalue()

            filename = self.raster.url.replace('.tif', '.png')[1:]

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


# ############## THIS IS JUST AN IDEA

# #################TODO:
# ### Handle multiple files from "shapefile" format
# ### I believe that to do this, we will need to create another model just to handle the files
# ### Something similar to the link bellow


"""
ogr2ogr -f "PostgreSQL" PG:"dbname=mydatabase user=myuser password=mypassword host=localhost port=5432" -nln mytable -nlt PROMOTE_TO_MULTI -update -overwrite -skipfailures /path/to/your/shapefile
"""


class Vector(models.Model):
    filename = models.CharField(max_length=100, null=True, blank=True)
    format_name = models.CharField(max_length=10, null=True, blank=True)
    file = models.FileField(upload_to=generate_upload_path)  # "vectors/")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dbname = models.CharField(
        max_length=100, unique=True, null=True, blank=True
    ) 

    def __str__(self):
        return f'{self.filename} -> USER: {self.user.username}'

    def save(self, *args, **kwargs):
        if not self.filename:
            self.filename = self.generate_unique_filename()

        name = os.path.splitext(os.path.basename(self.filename))[0]
        dbname = f'{self.user.username}-{name}'
        dbname = (
            dbname.lower()
            .replace('-', '_')
            .replace(')', '')
            .replace('(', '_')
            .replace(' ', '')
        )

        self.dbname = dbname
        self.format_name = os.path.splitext(self.file.name)[-1]

        super().save(*args, **kwargs)
        self.import_to_postgis()

    def get_file_name(self):
        return os.path.splitext(self.file.name)[0]

    def generate_unique_filename(self):
        base_filename = os.path.splitext(self.file.name)[0]
        counter = 1
        unique_filename = base_filename

        while Vector.objects.filter(
            filename=unique_filename, user=self.user
        ).exists():
            unique_filename = f'{base_filename}({counter})'
            counter += 1

        return unique_filename

    def run_command(self, command):
        result = subprocess.run(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return result

    def import_to_postgis(self):
        # TODO:
        # There is a problem when there is an error with the Postgres command
        # If the error is with the ogr2ogr command I could raise the exception
        # but when the error is inside postgres, I got no error and the code runs ok
        # to be able to test, you can use the file:
        # backend/tests/data/areateste_4yjAKqv.geojson
        ogr2ogr_command = self.generate_ogr2ogr_command()
        result = self.run_command(ogr2ogr_command)

        if result.returncode != 0:
            raise Exception(result.stderr)
            # print(f"Error executing ogr2ogr command: {result.stderr}")

    def generate_ogr2ogr_command(self):
        db_settings = settings.DATABASES['default']
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_password = db_settings['PASSWORD']
        db_host = db_settings['HOST']
        db_port = db_settings['PORT']

        # TODO:
        #### NEED TO DOUBLE CHECK THIS!!!!!
        ogr2ogr_command = f"ogr2ogr -f PostgreSQL PG:'dbname={db_name} user={db_user} password={db_password} host={db_host} port={db_port}' {self.file.path} -nln {self.dbname}"
        print(ogr2ogr_command)
        return ogr2ogr_command


# #### SOME OPTIONS:
# ##########################################################################################################
# # https://gis.stackexchange.com/questions/55219/geodjango-users-uploaded-shapefiles-and-model-creation
# ##########################################################################################################


# ############################# Here for the future, to connect to the user postgis
# ############################# No tests made yet
# class PostGIS(models.Model):
#     host = models.CharField(max_length=100)
#     port = models.IntegerField(default=5432)
#     username = models.CharField()


class Project(models.Model):
    name = models.CharField(max_length=100)
    thumbnail = models.ImageField(null=True, blank=True)
    geojson = models.ManyToManyField(GeoJSONFile, blank=True)
    vector = models.ManyToManyField(Vector, blank=True)
    # vector = models.ManyToManyField(GeoJSONFile,blank=True)
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
