from rest_framework import serializers  # Import Django REST Framework serializers
from .models import WebsiteUser, Book, Chapter  # Import models

# Serializer for User model
class UserSerializer(serializers.ModelSerializer):
    """
    Serializes the WebsiteUser model for user registration and retrieval.
    """
    class Meta:
        model = WebsiteUser
        fields = ["user_id", "email", "password", "first_name", "last_name", "date_of_birth"]
        extra_kwargs = {"password": {"write_only": True}}  # Hide password in responses

    def create(self, validated_data):
        """
        Creates a new user with hashed password using the custom user manager.
        """
        return WebsiteUser.objects.create_user(**validated_data)  # Simplified user creation




# Serializer for Book model
class BookSerializer(serializers.ModelSerializer):
    """
    Serializes the Book model, ensuring 'author' is read-only.
    """
    class Meta:
        model = Book
        fields = ["book_id", "title", "description", "genres", "language", "mature", "cover_photo", "author", "created_at"]
        extra_kwargs = {"author": {"read_only": True}}  # Author is assigned automatically



class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['chapter_id', 'chapter_title', 'chapter_number', 'chapter_content', 'chapter_status', 'book']  # Include all relevant fields
        extra_kwargs = {
            'chapter_title': {'allow_blank': True},  # Allow empty string
            'chapter_content': {'allow_blank': True},  # Allow empty string 
        }

