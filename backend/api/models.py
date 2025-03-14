from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import WebsiteUserManager



class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey('api.WebsiteUser', on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

class WebsiteUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = None  # Remove the username field

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # Empty since email is the only required field

    objects = WebsiteUserManager()  # Use your custom manager

    def __str__(self):
        return self.email
    