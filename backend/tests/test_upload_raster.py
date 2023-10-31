import pytest
from rest_framework.test import APIClient
from django.urls import reverse

from main.models import RasterFile

@pytest.fixture
def client():
    return APIClient()

url_base = 'localhost:8000'

@pytest.mark.django_db
def test_tif_file(client):
    url = '/api/main/rasters/'
    
    file_path = './tests/data/raster_s2_20200822_22JFR_BRGN.tif'  

    data = {
        'name': 'Teste',
    }

    with open(file_path, 'rb') as file:
        data['raster'] = file

        response = client.post(url, data, format='multipart')

    assert response.status_code == 201
    assert RasterFile.objects.count() == 1
    assert RasterFile.objects.get().name == 'Teste'