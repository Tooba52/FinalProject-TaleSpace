from django.contrib.auth.models import BaseUserManager # Import Django's base user manager

class WebsiteUserManager(BaseUserManager): # Custom user manager for WebsiteUser
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and returns a regular user with an email and password.
        """
        if not email:
            raise ValueError("The Email field must be set") # Ensure email is provided
        email = self.normalize_email(email)  # Normalize email to lowercase
        user = self.model(email=email, **extra_fields)  # Create a user instance with provided details
        user.set_password(password)  # Hash and set the password
        user.save(using=self._db)  # Save the user to the database
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and returns a superuser with all admin privileges.
        """
        extra_fields.setdefault("is_staff", True)  # Ensure superuser has staff status
        extra_fields.setdefault("is_superuser", True)  # Ensure superuser has admin privileges

        return self.create_user(email, password, **extra_fields)  # Create user with superuser permissions


# Explanation:
# BaseUserManager Inheritance:

# Django provides BaseUserManager to customize user creation.

# This allows defining how users and superusers are created without relying on a default username field.

# create_user(email, password, **extra_fields):

# Ensures that every user has an email.

# Converts the email to lowercase for consistency.

# Sets the password securely using set_password().

# Saves the user to the database.

# create_superuser(email, password, **extra_fields):

# Uses setdefault to ensure that is_staff and is_superuser are True.

# Calls create_user() to create a user with elevated privileges.

# Why This is Needed:
# The default Django user model expects a username for authentication.

# Since WebsiteUser uses an email instead, a custom user manager is required to handle user creation properly.

# This ensures the authentication system works smoothly while allowing user creation with an email-based login.