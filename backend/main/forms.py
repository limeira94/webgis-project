from django import forms

from .models import GeoJSONFile


class GeoJSONFileForm(forms.ModelForm):
    class Meta:
        model = GeoJSONFile
        fields = ('name', 'geojson')
