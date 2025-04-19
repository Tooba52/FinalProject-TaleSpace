import pytest
from api.models import WebsiteUser, Book, Chapter, Favourite, Comment, Follow


@pytest.mark.django_db
class TestModels:
    def test_create_website_user(self):
        """Test creating a  user"""
        user = WebsiteUser.objects.create_user(
            email="test@example.com",
            password="ValidPass123!",
            first_name="Test",
            last_name="User"
        )
        assert user.email == "test@example.com"
        assert user.first_name == "Test"
        assert user.check_password("ValidPass123!")
        assert not user.is_superuser

    def test_create_book(self):
        """Test creating a book"""
        author = WebsiteUser.objects.create_user(
            email="author@example.com",
            password="AuthorPass123!"
        )
        book = Book.objects.create(
            title="Test Book",
            description="A test book",
            genres=["fiction", "adventure"],
            language="English",
            author=author,
            author_name="Test Author"
        )
        assert book.title == "Test Book"
        assert book.author == author
        assert book.genres == ["fiction", "adventure"]
        assert book.description == "A test book"

    def test_create_chapter(self):
        """Test creating a chapter"""
        author = WebsiteUser.objects.create_user(
            email="author@example.com",
            password="AuthorPass123!"
        )
        book = Book.objects.create(
            title="Test Book",
            description="A test book",
            genres=["fiction"],
            language="English",
            author=author
        )
        chapter = Chapter.objects.create(
            chapter_number=1,
            chapter_content="This is chapter 1",
            book=book
        )
        assert chapter.book == book
        assert chapter.chapter_number == 1
        assert chapter.chapter_status == "draft"

    def test_create_favourite(self):
        """Test creating a favourite"""
        user = WebsiteUser.objects.create_user(
            email="user@example.com",
            password="UserPass123!"
        )
        author = WebsiteUser.objects.create_user(
            email="author@example.com",
            password="AuthorPass123!"
        )
        book = Book.objects.create(
            title="Favourite Book",
            description="A favourite book",
            genres=["romance"],
            language="English",
            author=author
        )
        favourite = Favourite.objects.create(
            user=user,
            book=book
        )
        assert favourite.user == user
        assert favourite.book == book

    def test_create_comment(self):
        """Test creating a comment"""
        user = WebsiteUser.objects.create_user(
            email="commenter@example.com",
            password="CommentPass123!"
        )
        author = WebsiteUser.objects.create_user(
            email="author@example.com",
            password="AuthorPass123!"
        )
        book = Book.objects.create(
            title="Book with Comments",
            description="A book with comments",
            genres=["drama"],
            language="English",
            author=author
        )
        comment = Comment.objects.create(
            comment_user=user,
            comment_book=book,
            comment_content="Great book!"
        )
        assert comment.comment_content == "Great book!"
        assert comment.comment_user == user
        assert comment.comment_book == book 

    def test_create_follow(self):
        """Test creating a follow relationship"""
        user1 = WebsiteUser.objects.create_user(
            email="follower@example.com",
            password="FollowerPass123!"
        )
        user2 = WebsiteUser.objects.create_user(
            email="followed@example.com",
            password="FollowedPass123!"
        )
        follow = Follow.objects.create(
            follower=user1,
            followed=user2
        )
        assert follow.follower == user1
        assert follow.followed == user2