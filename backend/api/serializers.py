from rest_framework import serializers 
from .models import WebsiteUser, Book, Chapter, Comment, Favourite


# ========================
# Serializer for User model
# ========================
class UserSerializer(serializers.ModelSerializer):
    """Handles user registration and profile serialization"""
    class Meta:
        model = WebsiteUser
        fields = ["user_id", "email", "password", "first_name", "last_name", "date_of_birth", "dark_mode_enabled"]
        extra_kwargs = {
            'password': {'write_only': True},
            'dark_mode_enabled': {'required': False}  # Make it optional for updates
        }

    def create(self, validated_data):
        """Create user with properly hashed password"""
        return WebsiteUser.objects.create_user(**validated_data)



# ========================
# Serializer for Book model
# ========================
class BookSerializer(serializers.ModelSerializer):
    """Handles book data serialization"""
    cover_url = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ["book_id", "title", "description", "genres", "language", "mature", "cover_photo", "cover_url", "author", "author_name", "created_at", "status"]
        extra_kwargs = {"author": {"read_only": True}}  # Author is assigned automatically

    def get_author_name(self, obj):
        # Return author's first name if author exists and has a name
        if obj.author and obj.author.first_name:
            return obj.author.first_name
        return "Unknown Author"  # Fallback

    def get_cover_url(self, obj):
        if obj.cover_photo:
            # Remove any existing path segments
            filename = str(obj.cover_photo).split('/')[-1]  # Gets just '123.jpg'
            if 'request' in self.context:
                return self.context['request'].build_absolute_uri(f'/book_covers/{filename}')
            return f'/book_covers/{filename}'
        return None




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


# ========================
# Serializer for favourite model
# ========================
class FavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favourite
        fields = ['id', 'user', 'book', 'created_at']
        read_only_fields = ['id', 'created_at']

# ========================
# Serializer for Comment model
# ========================
class CommentSerializer(serializers.ModelSerializer):
    comment_user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['comment_id', 'comment_content', 'comment_user', 'comment_book', 'comment_created_at', 'comment_user_full_name']

    def get_comment_user_full_name(self, obj):
        return f"{obj.comment_user.first_name} {obj.comment_user.last_name}"
