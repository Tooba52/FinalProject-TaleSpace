from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import WebsiteUserManager
from django.core.exceptions import ValidationError
import re

def validate_strong_password(value):
    if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$', value):
        raise ValidationError(
            "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        )

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey("WebsiteUser", on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class WebsiteUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = None  # Remove the username field
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    password = models.CharField(validators=[validate_strong_password], max_length=128)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = WebsiteUserManager()  # Use your custom manager

    def __str__(self):
        return self.email
    