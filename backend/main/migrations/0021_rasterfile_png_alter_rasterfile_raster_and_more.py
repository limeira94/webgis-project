# Generated by Django 4.1.13 on 2024-01-26 17:38

import django.core.validators
from django.db import migrations, models
import main.utils


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0020_geojsonfile_attributes'),
    ]

    operations = [
        migrations.AddField(
            model_name='rasterfile',
            name='png',
            field=models.FileField(blank=True, null=True, upload_to=main.utils.generate_upload_path_raster),
        ),
        migrations.AlterField(
            model_name='rasterfile',
            name='raster',
            field=models.FileField(upload_to=main.utils.generate_upload_path_raster, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['tif', 'tiff']), main.utils.validate_file_size]),
        ),
        migrations.DeleteModel(
            name='AttributeDataT',
        ),
    ]