# Generated by Django 4.2.4 on 2023-09-10 19:27

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='GeoJSONFile',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('name', models.CharField(max_length=255)),
                (
                    'geojson',
                    django.contrib.gis.db.models.fields.PolygonField(
                        srid=4326
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name='Shapefile',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('name', models.CharField(max_length=100)),
                ('shapefile', models.FileField(upload_to='shapefiles/')),
            ],
        ),
    ]
