from rest_framework import serializers 
from .models import WebsiteUser, Book, Chapter 


# ========================
# Serializer for User model
# ========================
class UserSerializer(serializers.ModelSerializer):
    """Handles user registration and profile serialization"""
    class Meta:
        model = WebsiteUser
        fields = ["user_id", "email", "password", "first_name", "last_name", "date_of_birth"]
        extra_kwargs = {"password": {"write_only": True}}  # Never show password in responses

    def create(self, validated_data):
        """Create user with properly hashed password"""
        return WebsiteUser.objects.create_user(**validated_data)



# ========================
# Serializer for Book model
# ========================
class BookSerializer(serializers.ModelSerializer):
    """Handles book data serialization"""
    class Meta:
        model = Book
        fields = ["book_id", "title", "description", "genres", "language", "mature", "cover_photo", "author", "created_at"]
        extra_kwargs = {"author": {"read_only": True}}  # Author is assigned automatically



# ========================
# Serializer for Book title
# ========================
class BookTitleSerializer(serializers.ModelSerializer):
    """Minimal serializer for book titles (used in chapter views)"""
    class Meta:
        model = Book
        fields = ['title']


# ========================
# Serializer for chapter model
# ========================
class ChapterSerializer(serializers.ModelSerializer):
    """Handles chapter serialization with nested book details"""

    # Write fields
    book = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        write_only=True
    )
    
    # Read fields
    book_detail = BookTitleSerializer(
        source='book',
        read_only=True
    )
    class Meta:
        model = Chapter
        fields = ['chapter_id', 'chapter_title', 'chapter_number', 'chapter_content', 'chapter_status', 'book', 'book_detail'] 
        extra_kwargs = {
            'chapter_title': {'allow_blank': True},  
            'chapter_content': {'allow_blank': True}, 
        }

