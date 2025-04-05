from django.contrib.auth.models import BaseUserManager # Import base user manager

class WebsiteUserManager(BaseUserManager):
    """
    creates a custom WebsiteUser 
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and returns a regular user with an email and password.
        """
        if not email:
            raise ValueError("The Email field must be set") # Ensure email is provided
        email = self.normalize_email(email)   # Clean up the email by normalizing it (lowercase, etc)
        user = self.model(email=email, **extra_fields)  # Create the user with the provided details
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
