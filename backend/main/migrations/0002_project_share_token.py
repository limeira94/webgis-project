from django.db import migrations, models
import uuid

def generate_unique_tokens(apps, schema_editor):
    Project = apps.get_model('main', 'Project')
    for project in Project.objects.all():
        project.share_token = uuid.uuid4()
        project.save()

class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),  # ou a migração anterior
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='share_token',
            field=models.UUIDField(default=uuid.uuid4, editable=False),
        ),
        migrations.RunPython(generate_unique_tokens),
    ]
