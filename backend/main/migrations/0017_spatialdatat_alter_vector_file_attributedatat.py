from django.db import migrations

def delete_tables(apps, schema_editor):
    # Substitua 'main_spatialdatat' pelo nome da primeira tabela que deseja excluir
    # Execute o comando SQL para excluir a tabela
    schema_editor.execute("DROP TABLE IF EXISTS main_spatialdatat;")

    # Substitua 'main_attributedatat' pelo nome da segunda tabela que deseja excluir
    # Execute o comando SQL para excluir a tabela
    schema_editor.execute("DROP TABLE IF EXISTS main_attributedatat;")

class Migration(migrations.Migration):

    dependencies = [
        ('main', '0016_alter_vector_file'),
    ]

    operations = [
        migrations.RunPython(
            code=delete_tables,
        ),
    ]

