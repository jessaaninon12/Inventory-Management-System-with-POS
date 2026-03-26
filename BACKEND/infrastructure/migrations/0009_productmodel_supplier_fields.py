from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('infrastructure', '0008_add_performance_indexes'),
    ]

    operations = [
        migrations.AddField(
            model_name='productmodel',
            name='supplier_name',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='productmodel',
            name='supplier_contact',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='productmodel',
            name='is_orderable',
            field=models.BooleanField(default=True),
        ),
    ]
