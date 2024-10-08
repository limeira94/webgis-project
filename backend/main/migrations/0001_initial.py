# Generated by Django 5.1 on 2024-09-02 20:39

import django.contrib.gis.db.models.fields
import django.core.validators
import django.db.models.deletion
import main.utils
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Geojson',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('attributes', models.JSONField(blank=True, null=True)),
                ('style', models.JSONField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='RasterFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('raster', models.FileField(upload_to='', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['tif', 'tiff']), main.utils.validate_file_size])),
                ('png', models.FileField(blank=True, null=True, upload_to=main.utils.generate_upload_path_raster)),
                ('tiles', models.CharField(blank=True, default='', max_length=300, null=True)),
                ('bands', models.IntegerField(default=0)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='RasterVisual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.CharField(max_length=50)),
                ('png', models.FileField(upload_to=main.utils.generate_upload_path_raster)),
                ('raster', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='main.rasterfile')),
            ],
        ),
        migrations.CreateModel(
            name='VectorFileModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(blank=True, null=True, upload_to='')),
                ('format_name', models.CharField(blank=True, max_length=20, null=True)),
                ('name', models.CharField(max_length=100)),
                ('geoms', models.ManyToManyField(to='main.geojson')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='')),
                ('public', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('raster', models.ManyToManyField(blank=True, to='main.rasterfile')),
                ('vector', models.ManyToManyField(blank=True, to='main.vectorfilemodel')),
            ],
        ),
    ]
