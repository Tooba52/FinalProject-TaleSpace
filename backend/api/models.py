from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import WebsiteUserManager



class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=100)  # Add First Name
    last_name = models.CharField(max_length=100)   # Add Last Name
    date_of_birth = models.DateField(null=True, blank=True)  # Add Date of Birth

    def __str__(self):
        return self.title

class WebsiteUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = None  # Remove the username field
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = WebsiteUserManager()  # Use your custom manager

    def __str__(self):
        return self.email
    