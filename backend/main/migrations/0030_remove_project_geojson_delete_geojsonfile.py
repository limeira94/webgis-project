# Generated by Django 5.0.4 on 2024-08-09 22:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0029_alter_geojson_style_alter_vectorfilemodel_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='geojson',
        ),
        migrations.DeleteModel(
            name='GeoJSONFile',
        ),
    ]
