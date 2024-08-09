from django.contrib import admin

from .models import * 


admin.site.register(RasterFile)
# admin.site.register(GeoJSONFile)
admin.site.register(VectorFileModel)
admin.site.register(Project)
