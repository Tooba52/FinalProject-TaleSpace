import pytest
from api.models import WebsiteUser, Book, Chapter, Favourite, Comment, Follow
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

# ================================================
# Fixtures
@pytest.fixture
def api_client():
    """Regular unauthenticated API client"""
    return APIClient()

@pytest.fixture
def test_user():
    """Create and return a test user"""
    return User.objects.create_user(
        email="test@example.com",
        password="testpass123",
        first_name="Test",
        last_name="User"
    )

@pytest.fixture
def auth_client(api_client, test_user):
    """Authenticated API client"""
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def second_user():
    """Create and return a second test user"""
    return User.objects.create_user(
        email="other@example.com",
        password="testpass123"
    )

@pytest.fixture
def public_book(second_user):
    """Create and return a public book"""
    return Book.objects.create(
        title="Public Book",
        description="Test",
        genres=["fiction"],
        status="public",
        author=second_user,
        author_name="Test Author"
    )

# ================================================
# User Views Tests
@pytest.mark.django_db
def test_user_registration(api_client):
    """Test new user can register"""
    url = reverse('register')
    data = {
        'email': 'new@example.com',
        'password': 'TestPass123!',
        'first_name': 'Test',
        'last_name': 'User'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(email='new@example.com').exists()

@pytest.mark.django_db
def test_authenticated_profile_access(auth_client):
    """Test logged-in user can access profile"""
    url = reverse('current-user-profile')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK

# ================================================
# Book Views Tests
@pytest.mark.django_db
def test_create_book(auth_client):
    """Test authenticated user can create book"""
    url = reverse('book-list-create')
    data = {
        'title': 'Test Book',
        'description': 'Test description',
        'genres': ['fiction'],
        'language': 'English',
        'status': 'private',
        'author_name': 'Test Author'
    }
    response = auth_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert Book.objects.filter(title='Test Book').exists()

@pytest.mark.django_db
def test_get_public_books(api_client, public_book):
    """Test anyone can view public books"""
    response = api_client.get(reverse('book-list-create'))
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) > 0
    assert any(b['title'] == 'Public Book' for b in response.data['results'])

# ================================================
# Favourite Views Tests
@pytest.mark.django_db
def test_add_favourite(auth_client, public_book):
    """Test user can favorite a book"""
    response = auth_client.post(
        reverse('add-favourite', args=[public_book.book_id])
    )
    assert response.status_code == status.HTTP_200_OK
    assert Favourite.objects.filter(book=public_book).exists()

# ================================================
# Follow Views Tests
@pytest.mark.django_db
def test_follow_user(auth_client, test_user, second_user):
    """Test user can follow another user"""
    response = auth_client.post(
        reverse('follow-user', args=[second_user.pk])
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert Follow.objects.filter(follower=test_user, followed=second_user).exists()