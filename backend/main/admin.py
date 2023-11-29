from django.contrib import admin
from .models import *#RasterFile,GeoJSONFile

# Register your models here.


admin.site.register(RasterFile)
admin.site.register(GeoJSONFile)
admin.site.register(Project)
