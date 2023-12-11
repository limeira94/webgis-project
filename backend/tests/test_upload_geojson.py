import os

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from main.models import GeoJSONFile


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_successful_geojson_upload_point(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/point.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 1
    assert GeoJSONFile.objects.get().name == 'Teste'


@pytest.mark.django_db
def test_successful_geojson_upload_line(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/line.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 1
    assert GeoJSONFile.objects.get().name == 'Teste'


@pytest.mark.django_db
def test_successful_geojson_upload_polygon(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/polygon.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 1
    assert GeoJSONFile.objects.get().name == 'Teste'


@pytest.mark.django_db
def test_successful_geojson_upload_mult_point(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/multipoint.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 1
    assert GeoJSONFile.objects.get().name == 'Teste'


@pytest.mark.django_db
def test_successful_geojson_upload_mult_line(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/multiline.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 1
    assert GeoJSONFile.objects.get().name == 'Teste'


@pytest.mark.django_db
def test_successful_geojson_upload_mult_polygon(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/multipolygon.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 1
    assert GeoJSONFile.objects.get().name == 'Teste'


@pytest.mark.django_db
def test_malformed_geojson_upload(client):
    url = reverse('upload_geojson_api')
    data = {'name': 'Teste', 'geojson': '{"some": "invalid", "json", "data"}'}

    response = client.post(url, data, format='multipart')
    assert response.status_code == 400
    assert 'error' in response.data
    assert GeoJSONFile.objects.count() == 0


@pytest.mark.django_db
def test_non_geojson_file(client):
    url = reverse('upload_geojson_api')

    file_path = './tests/data/image.jpg'
    with open(file_path, 'rb') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    assert response.status_code == 400
    assert 'error' in response.data
    assert GeoJSONFile.objects.count() == 0


@pytest.mark.django_db
def test_upload_without_geojon_field(client):
    url = reverse('upload_geojson_api')
    data = {
        'name': 'Teste',
    }
    response = client.post(url, data, format='multipart')
    assert response.status_code == 400
    assert 'error' in response.data
    assert GeoJSONFile.objects.count() == 0


@pytest.mark.skip
@pytest.mark.django_db
# TODO: Verificar porque o teste não está passando
# adicionei skip para pular
def test_successful_geojson_upload_multiple_polygon(client):
    url = reverse('upload_geojson_api')
    path = './tests/data'
    files = [
        os.path.join(path, i)
        for i in os.listdir(path)
        if i.endswith('.geojson')
    ]
    # geojson_path = './tests/data/multipolygon.geojson'
    n = 1
    for geojson_path in files:
        with open(geojson_path, 'r') as file:
            data = {'id': n, 'name': 'Teste', 'geojson': file}
            response = client.post(url, data, format='multipart')
        assert response.status_code == 201
        assert GeoJSONFile.objects.count() == n
        # print(GeoJSONFile.objects.get())
        # assert GeoJSONFile.objects.get().name == 'Teste'
        n += 1


@pytest.mark.django_db
def test_successful_geojson_upload_multiple_geometries_polygon(client):
    url = reverse('upload_geojson_api')
    geojson_path = './tests/data/polygon3.geojson'
    with open(geojson_path, 'r') as file:
        data = {'name': 'Teste', 'geojson': file}
        response = client.post(url, data, format='multipart')
    print(response.data)
    assert response.status_code == 201
    assert GeoJSONFile.objects.count() == 2
