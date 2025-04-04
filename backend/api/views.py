from django.contrib.auth import get_user_model
from rest_framework import generics, status
from .serializers import UserSerializer, BookSerializer, ChapterSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Book, Chapter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication


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
        book = serializer.save(author=self.request.user)  # Assign the logged-in user as the author
        # Now, create a default chapter for this new book
        self.create_default_chapter(book)

    def create_default_chapter(self, book):
        # Check if the book already has chapters; if not, create a default one
        default_chapter_data = {
            'chapter_number': 1,
            'chapter_title': ' ',
            'chapter_content': ' ',
            'chapter_status': 'draft',
            'book': book.book_id
        }
        # Create the default chapter
        default_chapter_serializer = ChapterSerializer(data=default_chapter_data)
        if default_chapter_serializer.is_valid():
            default_chapter_serializer.save()
        else:
            raise Exception("Error creating default chapter: " + str(default_chapter_serializer.errors))
            



class BookDelete(generics.DestroyAPIView):
    """
    API endpoint for deleting a book.
    - Only the book's author can delete it.
    """
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user)  # Ensure users can only delete their own books
    
    


# ========================
# CHAPTER MANAGEMENT VIEWS
# ========================
class ChapterListCreateView(APIView):
    # Handles:
    # GET /api/books/<book_id>/chapters/  - List ALL chapters in a book
    # POST /api/books/<book_id>/chapters/ - CREATE a new chapter
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        """
        Fetch all chapters for a specific book by book_id.
        """
        try:
            book = Book.objects.get(book_id=book_id)
            chapters = Chapter.objects.filter(book=book).order_by('chapter_number')

            serializer = ChapterSerializer(chapters, many=True)
            return Response(serializer.data)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, book_id):
        """
        Create a new chapter for the specified book by book_id.
        """
        try:
            book = Book.objects.get(book_id=book_id)

            # Get the highest chapter_number in the book (or default to 0 if none)
            last_chapter = Chapter.objects.filter(book=book).order_by('-chapter_number').first()
            next_chapter_number = last_chapter.chapter_number + 1 if last_chapter else 1

            # Inject book and chapter_number into request data
            data = request.data.copy()
            data['book'] = book.book_id
            data['chapter_number'] = next_chapter_number

            serializer = ChapterSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)


class ChapterDetailView(APIView):
    # Handles:
    # GET /api/books/<book_id>/chapters/<chapter_id>/  - Get ONE chapter
    # PUT /api/books/<book_id>/chapters/<chapter_id>/  - UPDATE a chapter
    # DELETE /api/books/<book_id>/chapters/<chapter_id>/ - DELETE a chapter
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id, chapter_id):
        """
        Fetch a specific chapter by its book_id and chapter_number.
        """
        try:
            book = Book.objects.get(book_id=book_id)
            chapter = Chapter.objects.get(book=book, chapter_id=chapter_id)
            serializer = ChapterSerializer(chapter)
            return Response(serializer.data)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, book_id, chapter_id):
        """
        Update a specific chapter by its book_id and chapter_number.
        """
        try:
            print(f"Received request to update chapter: {chapter_id} of book: {book_id}")  # Debugging line

            book = Book.objects.get(book_id=book_id)
            chapter = Chapter.objects.get(book=book, chapter_id=chapter_id)
            serializer = ChapterSerializer(chapter, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, book_id, chapter_id):
        """
        Delete a specific chapter by its book_id and chapter_number.
        """
        try:
            book = Book.objects.get(book_id=book_id)
            chapter = Chapter.objects.get(book=book, chapter_id=chapter_id)
            chapter.delete()
            return Response({"detail": "Chapter deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)

# class BookContentView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, book_id):
#         user = request.user  # Check if this is None
#         print("🔍 User:", user)  # Debugging
#         return Response({"message": "Book content fetched successfully."})
    
#     def put(self, request, book_id):
#         try:
#             book = Book.objects.get(id=book_id)
#             # Assuming you're using a serializer to update book content
#             serializer = BookContentSerializer(book, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Book.DoesNotExist:
#             return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        
#         try:
#             # Fetch the book by its ID
#             book = Book.objects.get(book_id=book_id)
            
#             # Fetch the related BookContent
#             book_content = BookContent.objects.get(book=book)
            
#             # Serialize the incoming content update with partial=True to allow partial updates
#             serializer = BookContentSerializer(book_content, data=request.data, partial=True)
            
#             # Check if the data is valid
#             if serializer.is_valid():
#                 # Save the updated content
#                 serializer.save()
#                 return Response(serializer.data)
            
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         except Book.DoesNotExist:
#             return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
#         except BookContent.DoesNotExist:
#             return Response({"detail": "Book content not found."}, status=status.HTTP_404_NOT_FOUND)


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

