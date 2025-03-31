from rest_framework import serializers  # Import Django REST Framework serializers
from .models import WebsiteUser, Note, Book  # Import models

# Serializer for User model
class UserSerializer(serializers.ModelSerializer):
    """
    Serializes the WebsiteUser model for user registration and retrieval.
    """
    class Meta:
        model = WebsiteUser
        fields = ["id", "email", "password", "first_name", "last_name", "date_of_birth"]
        extra_kwargs = {"password": {"write_only": True}}  # Hide password in responses

    def create(self, validated_data):
        """
        Creates a new user with hashed password using the custom user manager.
        """
        return WebsiteUser.objects.create_user(**validated_data)  # Simplified user creation


# Serializer for Note model
class NoteSerializer(serializers.ModelSerializer):
    """
    Serializes the Note model, making the 'author' field read-only.
    """
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}  # Prevent author modification


# Serializer for Book model
class BookSerializer(serializers.ModelSerializer):
    """
    Serializes the Book model, ensuring 'author' is read-only.
    """
    class Meta:
        model = Book
        fields = ["id", "title", "description", "genres", "language", "mature", "cover_photo", "author", "created_at"]
        extra_kwargs = {"author": {"read_only": True}}  # Author is assigned automatically

