from django.contrib.gis.geos import GEOSGeometry
import json


def get_geojson_bounds(geojson_data):
    """
    Essa função recebe um objeto GeoJson e retorna seus limites
    """
    geometry = GEOSGeometry(json.dumps(geojson_data))
    return geometry.extent