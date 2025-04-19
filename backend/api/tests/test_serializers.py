import pytest
from rest_framework.exceptions import ValidationError
from api.models import WebsiteUser, Book, Chapter, Comment, Favourite
from api.serializers import (
    UserSerializer,
    BookSerializer,
    BookTitleSerializer,
    ChapterSerializer,
    FavouriteSerializer,
    CommentSerializer,
    validate_strong_password
)
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model

User = get_user_model()


# ================================================
# Password Validator Test
@pytest.mark.django_db
def test_validate_strong_password():
    """Test password validator works correctly"""
    # Test valid passwords (should pass)
    for valid in ["ValidPass123!", "Another$123", "Test@1234", "Complex#1"]:
        validate_strong_password(valid)  
    
    # Test invalid passwords
    for invalid in ["weak", "NOlower1!", "noupper1!", "NoNumbers!!", "NoSpecial123"]:
        with pytest.raises(ValidationError) as excinfo:
            validate_strong_password(invalid)
        assert "Password must be" in str(excinfo.value)

# ================================================
# UserSerializer Tests
@pytest.mark.django_db
class TestUserSerializer:
    @pytest.fixture
    def valid_user_data(self):
        return {
            "email": "test@example.com",
            "password": "ValidPass123!",
            "first_name": "Test",
            "last_name": "User"
        }

    def test_create_user(self, valid_user_data):
        """Test user creation with valid data"""
        serializer = UserSerializer(data=valid_user_data)
        assert serializer.is_valid()
        user = serializer.save()
        assert user.email == "test@example.com"
        assert user.check_password("ValidPass123!")
        assert not user.is_superuser

    def test_password_write_only(self, valid_user_data):
        """Test password field is write-only"""
        serializer = UserSerializer(data=valid_user_data)
        serializer.is_valid()
        assert 'password' not in serializer.data

    def test_invalid_user_data(self):
        """Test validation with invalid data"""
        invalid_data = [
            {"email": "invalid", "password": "ValidPass123!"},  
            {"email": "test@example.com", "password": "weak"},   
            {"email": "test@example.com"}                         
        ]
        
        for data in invalid_data:
            serializer = UserSerializer(data=data)
            assert not serializer.is_valid()

# ================================================
# BookSerializer Tests
@pytest.mark.django_db
class TestBookSerializer:
    @pytest.fixture
    def test_author(self):
        return WebsiteUser.objects.create_user(
            email="author@example.com",
            password="testpass123",
            first_name="Author"
        )

    @pytest.fixture
    def valid_book_data(self, test_author):
        return {
            "title": "Test Book",
            "description": "Test description",
            "genres": ["fiction"],
            "language": "English",
            "mature": False,
            "author": test_author.pk
        }

    def test_book_serialization(self, test_author):
        """Test book serialization"""
        book = Book.objects.create(
            title="Serialized Book",
            author=test_author,
            genres=["fiction"]
        )
        serializer = BookSerializer(book)
        assert serializer.data["title"] == "Serialized Book"
        assert serializer.data["author_name"] == test_author.first_name

    def test_cover_url_generation(self, test_author, rf):
        """Test cover URL generation"""
        book = Book.objects.create(
            title="Book with Cover",
            author=test_author,
            genres=["fiction"]
        )
        book.cover_photo = SimpleUploadedFile("cover.jpg", b"file_content", content_type="image/jpeg")
        book.save()
        
        # Test with request in context
        request = rf.get('/')
        serializer = BookSerializer(book, context={'request': request})
        assert "http://testserver" in serializer.data["cover_url"]
        
        # Test without request in context
        serializer = BookSerializer(book)
        assert serializer.data["cover_url"] == book.cover_photo.url


# ================================================
# ChapterSerializer Tests
@pytest.mark.django_db
class TestChapterSerializer:
    @pytest.fixture
    def test_user(self):
        return User.objects.create_user(
            password='ValidPass123!',
            email='test@example.com'
        )

    @pytest.fixture
    def test_book(self, test_user):
        return Book.objects.create(
            title="Test Book",
            author=test_user,  
            genres=["fiction"]
        )

    @pytest.fixture
    def chapter_data(self, test_book):
        return {
            "chapter_number": 1,
            "chapter_title": "Test Chapter",
            "chapter_content": "Test content",
            "chapter_status": "draft",
            "book": test_book.pk
        }

    def test_chapter_serialization(self, test_book):
        """Test chapter serialization with nested book"""
        chapter = Chapter.objects.create(
            chapter_number=1,
            chapter_title="Test Chapter",
            chapter_content="Test content",
            chapter_status="draft",
            book=test_book,
        )
        serializer = ChapterSerializer(chapter)
        data = serializer.data
        
        assert data["chapter_number"] == 1
        assert data["chapter_title"] == "Test Chapter"
        assert data["book_detail"]["title"] == "Test Book"
        assert "book" not in data 

    def test_chapter_creation(self, chapter_data, test_book):
        """Test chapter creation"""
        serializer = ChapterSerializer(data=chapter_data)
        assert serializer.is_valid(), serializer.errors
        chapter = serializer.save()
        assert chapter.book == test_book
        assert chapter.chapter_number == chapter_data["chapter_number"]

# ================================================
# CommentSerializer Tests
@pytest.mark.django_db
class TestCommentSerializer:
    @pytest.fixture
    def test_data(self):
        author = WebsiteUser.objects.create_user(
            email="author@example.com",
            password="testpass123"
        )
        commenter = WebsiteUser.objects.create_user(
            email="commenter@example.com",
            password="testpass123",
            first_name="Commenter",
            last_name="User"
        )
        book = Book.objects.create(
            title="Comment Test Book",
            author=author,
            genres=["fiction"]
        )
        return {
            "author": author,
            "commenter": commenter,
            "book": book
        }

    def test_comment_serialization(self, test_data):
        """Test comment serialization with user full name"""
        comment = Comment.objects.create(
            comment_user=test_data["commenter"],
            comment_book=test_data["book"],
            comment_content="Great book!"
        )
        serializer = CommentSerializer(comment)
        assert serializer.data["comment_content"] == "Great book!"
        assert serializer.data["comment_user_full_name"] == "Commenter User"

# ================================================
# FavouriteSerializer Tests
@pytest.mark.django_db
class TestFavouriteSerializer:
    @pytest.fixture
    def test_data(self):
        user = WebsiteUser.objects.create_user(
            email="user@example.com",
            password="testpass123"
        )
        book = Book.objects.create(
            title="Favourite Book",
            author=user,
            genres=["fiction"]
        )
        return {
            "user": user,
            "book": book
        }

    def test_favourite_creation(self, test_data):
        """Test favourite creation"""
        data = {
            "user": test_data["user"].pk,
            "book": test_data["book"].pk
        }
        serializer = FavouriteSerializer(data=data)
        assert serializer.is_valid()
        favourite = serializer.save()
        assert favourite.user == test_data["user"]
        assert favourite.book == test_data["book"]