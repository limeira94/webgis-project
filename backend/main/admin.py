from django.contrib import admin

from .models import * 


admin.site.register(RasterFile)
admin.site.register(GeoJSONFile)
admin.site.register(Project)
admin.site.register(Vector)
