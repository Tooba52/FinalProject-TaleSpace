from django.db import models 
from django.contrib.auth.models import AbstractUser 
from django.core.exceptions import ValidationError
from django.contrib.auth.models import BaseUserManager

import re 


# ========================

# creates a custom WebsiteUser 
class WebsiteUserManager(BaseUserManager):

    # Creates and returns a regular user with an email and password.
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set") 
        email = self.normalize_email(email)   
        user = self.model(email=email, **extra_fields)  
        user.set_password(password) 
        user.save(using=self._db)  
        return user

    # Creates and returns a superuser with all admin privileges.
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)  
        extra_fields.setdefault("is_superuser", True) 

        return self.create_user(email, password, **extra_fields) 


# Function to validate strong passwords
#Validate password meets complexity requirements
def validate_strong_password(value):
    if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$', value):
        raise ValidationError(
            "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        )


#Extended user model using email as primary identifier
class WebsiteUser(AbstractUser):
    # Remove default username field and use email instead
    username = None  
    email = models.EmailField(unique=True)

    # User fields
    user_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)

    # Password field with validation
    password = models.CharField(validators=[validate_strong_password], max_length=128)  # Enforce strong password rules

    # Authentication configuration
    EMAIL_FIELD = "email"  # Define email as the primary authentication field
    USERNAME_FIELD = "email"  # Use email instead of username for login
    REQUIRED_FIELDS = []  # No additional required fields

    objects = WebsiteUserManager()  # Use custom user manager

    def __str__(self):
        return self.email  # Return email as string representation


# ========================


# Model representing a published book
class Book(models.Model):

    # status choices for books
    BOOK_STATUS_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    #fields for books
    book_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    genres = models.JSONField() 
    language = models.CharField(max_length=50)
    mature = models.BooleanField(default=False)  
    cover_photo = models.ImageField(upload_to='book_covers/', null=True, blank=True)  
    author = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE) 
    author_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    status = models.CharField(max_length=10, choices=BOOK_STATUS_CHOICES, default='private')
    view_count = models.IntegerField(default=0)


    def Book(self):
        return self  
    
    
# ========================


#Model representing a book chapter
class Chapter(models.Model):

    # Chapter status choices
    CHAPTER_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    #fields for chapters
    chapter_id = models.BigAutoField(primary_key=True) 
    chapter_title = models.CharField(max_length=255, blank=True, null=True)  
    chapter_number = models.IntegerField()  
    chapter_content = models.TextField()  
    chapter_status = models.CharField(max_length=10, choices=CHAPTER_STATUS_CHOICES, default='draft')  
    book = models.ForeignKey(Book, related_name='chapters', on_delete=models.CASCADE) 
    last_modified = models.DateTimeField(auto_now=True)

    # Prevent duplicate chapter numbers per book
    class Meta:
        unique_together = ['book', 'chapter_number'] 

    #Format: 'Chapter X: [Title] of [Book]
    def __str__(self):
        return f"Chapter {self.chapter_number}: {self.chapter_title or ' '} of {self.book.title}"
    

# ========================


#Model representing a favourite
class Favourite(models.Model):

    #fields for favourite
    user = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    #ensure book is only favourited once by the user
    class Meta:
        unique_together = ('user', 'book')


# ========================


#Model representing a comment on a book
class Comment(models.Model):

    # fields for comment
    comment_id = models.BigAutoField(primary_key=True)
    comment_user = models.ForeignKey(WebsiteUser, on_delete=models.CASCADE)  
    comment_book = models.ForeignKey(Book, related_name='comments', on_delete=models.CASCADE)  
    comment_content = models.TextField()  
    comment_created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"Comment by {self.comment_user.email} on {self.comment_book.title}"
    

# ========================


#Tracks who follows whom (simple follow/unfollow)"""
class Follow(models.Model):

    #fields for follow
    follower = models.ForeignKey(
        WebsiteUser, 
        related_name='following',  # users I follow
        on_delete=models.CASCADE
    )
    followed = models.ForeignKey(
        WebsiteUser, 
        related_name='followers',  # users following me
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # prevents duplicate follows
    class Meta:
        unique_together = ('follower', 'followed')  
        indexes = [
            models.Index(fields=['follower']),
            models.Index(fields=['followed']),
        ]

    def __str__(self):
        return f"{self.follower.email} follows {self.followed.email}"