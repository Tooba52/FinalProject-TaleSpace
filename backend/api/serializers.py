from rest_framework import serializers 
from .models import WebsiteUser, Book, Chapter, Comment, Favourite, validate_strong_password


# ========================


#Handles user registration and profile serialization
class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        validators=[validate_strong_password],  # attach the validator
    )

    class Meta:
        model = WebsiteUser
        fields = ["user_id", "email", "password", "first_name", "last_name", "date_of_birth"]
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    #Create user with properly hashed password
    def create(self, validated_data):
        return WebsiteUser.objects.create_user(**validated_data)



# ========================


#Handles book data serialization
class BookSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ["book_id", "title", "description", "genres", "language", "mature", "cover_url", "author", "author_name", "created_at", "status", "view_count"]
        extra_kwargs = {
            "author": {"read_only": True}, # Author is assigned automatically
            "cover_photo": {"write_only": True}  # Only for uploads, not in responses
            }  

    # Return author's first name if author exists and has a name
    def get_author_name(self, obj):
        if obj.author and obj.author.first_name:
            return obj.author.first_name
        return "Unknown Author" 

    #Returns full URL for cover photo if available
    def get_cover_url(self, obj):
        if obj.cover_photo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.cover_photo.url) if request else obj.cover_photo.url
        return None


# ========================


#Minimal serializer for book titles (used in chapter views)
class BookTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['title']


# ========================


#Handles chapter serialization with nested book details
class ChapterSerializer(serializers.ModelSerializer):

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


#serializer for favourite
class FavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favourite
        fields = ['id', 'user', 'book', 'created_at']
        read_only_fields = ['id', 'created_at']


# ========================


#Serializes Comment data including user's full name"
class CommentSerializer(serializers.ModelSerializer):
    comment_user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['comment_id', 'comment_content', 'comment_user', 'comment_book', 'comment_created_at', 'comment_user_full_name']

    # Returns commenter's full name (first + last name)
    def get_comment_user_full_name(self, obj):
        return f"{obj.comment_user.first_name} {obj.comment_user.last_name}"
