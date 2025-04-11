from django.db import models 
from django.contrib.auth.models import AbstractUser 
from .managers import WebsiteUserManager 
from django.core.exceptions import ValidationError 
import re 


# ========================
# Custom User Model
# ========================

# Function to validate strong passwords
def validate_strong_password(value):
    """Validate password meets complexity requirements"""
    if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$', value):
        raise ValidationError(
            "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        )
    
class WebsiteUser(AbstractUser):
    """Extended user model using email as primary identifier"""

    # Remove default username field and use email instead
    username = None  
    email = models.EmailField(unique=True)

    # Basic user fields
    user_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    dark_mode_enabled = models.BooleanField(default=False)

    # Password with validation
    password = models.CharField(validators=[validate_strong_password], max_length=128)  # Enforce strong password rules

    # Authentication settings
    EMAIL_FIELD = "email"  # Define email as the primary authentication field
    USERNAME_FIELD = "email"  # Use email instead of username for login
    REQUIRED_FIELDS = []  # No additional required fields

    objects = WebsiteUserManager()  # Use custom user manager

    def __str__(self):
        return self.email  # Return email as string representation


# ========================
# Book Model
# ========================
class Book(models.Model):
    """Model representing a book"""

    PUBLIC = 'public'
    PRIVATE = 'private'
    STATUS_CHOICES = [
        (PUBLIC, 'Public'),
        (PRIVATE, 'Private'),
    ]
    
    book_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    genres = models.JSONField()  # Stores list
    language = models.CharField(max_length=50)
    mature = models.BooleanField(default=False)  
    cover_photo = models.ImageField(upload_to='book_covers/', null=True, blank=True)  
    author = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE) 
    author_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PRIVATE)
    view_count = models.IntegerField(default=0)


    def Book(self):
        return self  
    
    
# ========================
# Chapter Model
# ========================

# Chapter status choices
STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('published', 'Published'),
]

class Chapter(models.Model):
    """Model representing a book chapter"""

    chapter_id = models.BigAutoField(primary_key=True) 
    chapter_title = models.CharField(max_length=255, blank=True, null=True)  
    chapter_number = models.IntegerField()  
    chapter_content = models.TextField()  
    chapter_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')  
    book = models.ForeignKey(Book, related_name='chapters', on_delete=models.CASCADE) 
    last_modified = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['book', 'chapter_number']  # Prevent duplicate chapter numbers per book

    def __str__(self):
        return f"Chapter {self.chapter_number}: {self.chapter_title or ' '} of {self.book.title}"
    

# ========================
# Favourite Model
# ========================
class Favourite(models.Model):
    user = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')


# ========================
# Comment Model
# ========================
class Comment(models.Model):
    """Model representing a comment on a book"""

    comment_id = models.BigAutoField(primary_key=True)
    comment_user = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)  # Commenter
    comment_book = models.ForeignKey(Book, related_name='comments', on_delete=models.CASCADE)  # Which book the comment is for
    comment_content = models.TextField()  # Comment text
    comment_created_at = models.DateTimeField(auto_now_add=True)  # Timestamp

    def __str__(self):
        return f"Comment by {self.comment_user.email} on {self.comment_book.title}"