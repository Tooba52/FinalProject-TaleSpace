# Generated by Django 5.1.7 on 2025-04-11 12:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_book_view_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='websiteuser',
            name='dark_mode_enabled',
            field=models.BooleanField(default=False),
        ),
    ]
