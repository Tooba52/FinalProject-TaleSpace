from django.contrib.auth import get_user_model
from rest_framework import generics
from .serializers import UserSerializer, BookSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Book
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer


User = get_user_model() # Get the custom user model


# ========================
# USER MANAGEMENT VIEWS
# ========================
class CreateUserView(generics.CreateAPIView):
    """
    API endpoint that allows users to register.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Anyone can create an account

class UserProfileView(APIView):
    """
    API endpoint to retrieve logged-in user details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)  # This includes first_name


# ========================
# BOOK MANAGEMENT VIEWS
# ========================
class BookListCreate(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating books.
    - Only authenticated users can access.
    - Users can only see their own books.
    - Users can create new books.
    """
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user)  # Fetch only the logged-in user's books

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)  # Assign the logged-in user as the author

class BookDelete(generics.DestroyAPIView):
    """
    API endpoint for deleting a book.
    - Only the book's author can delete it.
    """
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user)  # Ensure users can only delete their own books
    


# Explanation of views.py as a Whole
# The views.py file in your Django REST Framework (DRF) application defines API endpoints that handle user authentication, notes, and book management. It follows a class-based view (CBV) approach, leveraging DRF's generic views to simplify CRUD operations.

# Breakdown of Each Section
# USER MANAGEMENT
# CreateUserView

# Allows new users to register.

# Uses AllowAny, meaning authentication is not required to create an account.

# Uses UserSerializer to handle user data.

# NOTES MANAGEMENT
# NoteListCreate

# Lists and creates notes.

# Only authenticated users can access (IsAuthenticated).

# get_queryset() ensures users can only view their own notes.

# perform_create() ensures newly created notes are automatically assigned to the logged-in user.

# NoteDelete

# Deletes a note.

# Ensures that only the note’s author can delete it.

# BOOK MANAGEMENT
# BookListCreate

# Lists and creates books.

# Similar to notes, users can only access their own books.

# New books are assigned to the logged-in user.

# BookDelete

# Deletes a book.

# Ensures that only the book’s author can delete it.

