# Code resued from: 
# Author: Tech With Tim
# Video Title: https://www.youtube.com/watch?v=c-QsfbznSXI
# Video Link - Django & React Web App Tutorial - Authentication, Databases, Deployment & More...
# Code reused for serialziers were based of Tims serializers template, most serializers were mostly editted and changed to suit my site

from rest_framework import serializers 
from .models import WebsiteUser, Book, Chapter, Comment, Favourite, validate_strong_password


# ================================================

#Handles user registration and profile serialization
class UserSerializer(serializers.ModelSerializer):

    # password field with write-only access and password validation
    password = serializers.CharField(
        write_only=True,
        validators=[validate_strong_password],  
    )

    class Meta:
        model = WebsiteUser
        fields = ["user_id", "email", "password", "first_name", "last_name", "date_of_birth"]
        extra_kwargs = {
            'password': {'write_only': True}, # make sure password is not included 
        }
    
    #Create user with properly hashed password
    def create(self, validated_data):
        return WebsiteUser.objects.create_user(**validated_data)



# ================================================


#Handles book data serialization
class BookSerializer(serializers.ModelSerializer):

    # Custom fields to serialize cover URL and author name
    cover_url = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Book 
        fields = ["book_id", "title", "description", "genres", "language", "mature", "cover_photo", "cover_url", "author", "author_name", "created_at", "status"]
        extra_kwargs = {
            "author": {"read_only": True}, # Read only field for author
            "cover_photo": {"required": False}  # Make cover photo optional
        }

    def update(self, instance, validated_data):
        #  Handle updating the book the cover photo
        cover_photo = validated_data.pop('cover_photo', None)
        # Update other fields
        instance = super().update(instance, validated_data)
        
        # If new cover photo is provided, delete  old one and save  new one
        if cover_photo is not None:
            # Delete  old cover photo if it exists
            if instance.cover_photo:
                instance.cover_photo.delete(save=False)
            instance.cover_photo = cover_photo # Save  new cover photo
            instance.save()
        
        return instance

    # Get author's first name, fallback  "Unknown Author" if not available
    def get_author_name(self, obj):
        if obj.author and obj.author.first_name:
            return obj.author.first_name
        return "Unknown Author" 

    # Return full URL for cover photo, if available
    def get_cover_url(self, obj):
        if obj.cover_photo:
            if 'request' in self.context:
                return self.context['request'].build_absolute_uri(obj.cover_photo.url)
            return obj.cover_photo.url
        return None
    
# ================================================


#serializer for book titles (used in chapter views)
class BookTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book 
        fields = ['title'] # Only serialize the title field


# ================================================


#Handles chapter serialization with book details
class ChapterSerializer(serializers.ModelSerializer):

    # Write field for linking a chapter to a book 
    book = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        write_only=True
    )
    
    # Read-only field that gets detailed info about book
    book_detail = BookTitleSerializer(
        source='book',
        read_only=True
    )
    class Meta:
        model = Chapter 
        fields = ['chapter_id', 'chapter_title', 'chapter_number', 'chapter_content', 'chapter_status', 'book', 'book_detail'] 
        extra_kwargs = {
            'chapter_title': {'allow_blank': True},   # Allow blank chapter titles
            'chapter_content': {'allow_blank': True},  # Allow blank chapter content
        }


# ================================================


#serializer for favourite
class FavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favourite 
        fields = ['id', 'user', 'book', 'created_at']
        read_only_fields = ['id', 'created_at'] # Make ID and created_at fields read-only


# ================================================


#Serializes Comment data 
class CommentSerializer(serializers.ModelSerializer):

    # Custom field to return the commenter's full name
    comment_user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment 
        fields = ['comment_id', 'comment_content', 'comment_user', 'comment_book', 'comment_created_at', 'comment_user_full_name']

    # Method to get  commenter's full name (first + last name)
    def get_comment_user_full_name(self, obj):
        return f"{obj.comment_user.first_name} {obj.comment_user.last_name}"
