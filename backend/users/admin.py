from django.contrib import admin

# Register your models here.
from .models import Profile

# admin.site.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        obj.update_profile()
        super().save_model(request, obj, form, change)

admin.site.register(Profile, ProfileAdmin)