# Generated by Django 4.2.4 on 2023-10-23 18:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_rasterfile_bounds_rasterfile_png'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rasterfile',
            name='png',
            field=models.FileField(
                blank=True, null=True, upload_to='rasters/'
            ),
        ),
    ]
