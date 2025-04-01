from django.db import models  # Django's model framework
from django.contrib.auth.models import AbstractUser  # Base class for custom user models
from .managers import WebsiteUserManager  # Custom user manager
from django.core.exceptions import ValidationError  # For password validation
import re  # Regular expressions for validation

# Function to validate strong passwords
def validate_strong_password(value):
    """
    Ensures the password meets the following criteria:
    - At least 8 characters long
    - Contains uppercase, lowercase letters, a number, and a special character
    """
    if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$', value):
        raise ValidationError(
            "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        )

# Custom user model
class WebsiteUser(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)  # Use email as the unique identifier
    username = None  # Remove default username field
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)  # Optional
    password = models.CharField(validators=[validate_strong_password], max_length=128)  # Enforce strong password rules

    EMAIL_FIELD = "email"  # Define email as the primary authentication field
    USERNAME_FIELD = "email"  # Use email instead of username for login
    REQUIRED_FIELDS = []  # No additional required fields

    objects = WebsiteUserManager()  # Use custom user manager

    def __str__(self):
        return self.email  # Return email as string representation

# Model for storing user notes
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)  # Auto timestamp
    author = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)  # Link to user

    def __str__(self):
        return self.title  # Return note title

# Model for books
class Book(models.Model):
    book_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    genres = models.JSONField()  # Store genres as a JSON list
    language = models.CharField(max_length=50)
    mature = models.BooleanField(default=False)  # Mark mature content
    cover_photo = models.ImageField(upload_to='book_covers/', null=True, blank=True)  # Optional cover image
    author = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)  # Link book to author
    created_at = models.DateTimeField(auto_now_add=True)  # Auto timestamp

    def __str__(self):
        return self.title  # Return book title
