import json
import os
import urllib.request
from datetime import datetime

import requests
from django.conf import settings
from osgeo import gdal


def get_bounds(ds):
    xmin, xpixel, _, ymax, _, ypixel = ds.GetGeoTransform()
    width, height = ds.RasterXSize, ds.RasterYSize
    xmax = xmin + width * xpixel
    ymin = ymax + height * ypixel
    return xmin, ymin, xmax, ymax


def run(process, file, name):

    url = settings.GEOSERVER['URL']
    workspace = settings.GEOSERVER['WORKSPACE']
    login = settings.GEOSERVER['USERNAME']
    password = settings.GEOSERVER['PASSWORD']

    headers = {'Content-type': 'text/xml'}
    auth = (login, password)

    if process == 'cover':
        # xml = './xmls/coveragestore.xml'
        xml = 'main/xmls/coveragestore.xml'
    elif process == 'layer':
        # xml = './xmls/create_layer.xml'
        xml = 'main/xmls/create_layer.xml'

    with open(xml, 'r') as file_handle:
        xml_content = file_handle.read()

    if process == 'cover':
        url = f'{url}geoserver/rest/workspaces/{workspace}/coveragestores?configure=all'
        xml_payload = (
            xml_content.replace('{name}', name)
            .replace('{file}', 'http://127.0.0.1:8000/' + file)
            .replace('{workspace}', workspace)
        )
    elif process == 'layer':
        url = f'{url}geoserver/rest/workspaces/{workspace}/coveragestores/{name}/coverages'
        img = gdal.Open(file)
        xmin, ymin, xmax, ymax = get_bounds(img)

        xml_payload = xml_content.replace('{name}', name)
        xml_payload = xml_payload.replace('{title}', name)
        xml_payload = xml_payload.replace('{minx}', str(xmin))
        xml_payload = xml_payload.replace('{maxx}', str(xmax))
        xml_payload = xml_payload.replace('{miny}', str(ymin))
        xml_payload = xml_payload.replace('{maxy}', str(ymax))

    elif process == 'layerview':
        url = f'{url}geoserver/rest/workspaces/{workspace}/coveragestores/{name}/coverages'

    print(url)
    response = requests.post(url, headers=headers, auth=auth, data=xml_payload)

    if response.status_code == 201:
        print(f'{process} created successfully.')
    else:
        print(response.text)


def upload_file(file):
    name = os.path.basename(file).split('.')[0]
    run('cover', file[1:], name)
    run('layer', file[1:], name)


SERVER = os.environ.get('GEOSERVER_LINK')
if SERVER is None:
    SERVER = 'http://localhost:8080/geoserver'


def openjson(link):
    with urllib.request.urlopen(link) as url:
        data = json.load(url)
    return data


def get_all_layers_from_workspace(workspace):
    url = f'{SERVER}/rest/layers'

    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()['layers']['layer']
            data = [
                i['href'] for i in data if i['name'].split(':')[0] == workspace
            ]
        else:
            print(f'Request failed with status code: {response.status_code}')

    except requests.RequestException as e:
        message = 'Connection error, please check the server connection and try again.'
        return 401, message, None
        # print(f"An error occurred: {e}")
        # return 401,f"An error occurred: {e}",None

    links = []
    boundaries = []
    dates = []
    for d in data:
        d_ = openjson(d)
        j = openjson(d_['layer']['resource']['href'])

        name = j['coverage']['name']
        ws = j['coverage']['namespace']['name']
        bounds = j['coverage']['nativeBoundingBox']
        epsg = j['coverage']['nativeBoundingBox']['crs'].split(':')[-1]

        minx = bounds['minx']
        maxx = bounds['maxx']
        miny = bounds['miny']
        maxy = bounds['maxy']
        bbox = [minx, miny, maxx, maxy]

        link = f'url={SERVER}/{ws}/wms&format=image/png&layers={name}&styles=&crs=EPSG:{epsg}'
        links.append(link)
        boundaries.append(bbox)
    return 200, 'Ok', (links, dates, boundaries)


if __name__ == '__main__':
    links = get_all_layers_from_workspace()
    print(links)
