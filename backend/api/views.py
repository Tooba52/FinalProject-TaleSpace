from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer, BookSerializer, ChapterSerializer
from .models import Book, Chapter


User = get_user_model()


# ========================
# user managemnet views
# ========================
class CreateUserView(generics.CreateAPIView):
    """Handle user registration"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  


class UserProfileView(APIView):
    """Retrieve authenticated user's profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data) 


# ========================
# Book managemnet views
# ========================
class BookListCreate(generics.ListCreateAPIView):
    """List and create books (user-specific)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        return Book.objects.filter(author=self.request.user) 

    def perform_create(self, serializer):
        book = serializer.save(author=self.request.user)  
        self.create_default_chapter(book)

    def create_default_chapter(self, book):
        """Create default first chapter for new books"""
        default_chapter_data = {
            'chapter_number': 1,
            'chapter_title': ' ',
            'chapter_content': ' ',
            'chapter_status': 'draft',
            'book': book.book_id
        }
        default_chapter_serializer = ChapterSerializer(data=default_chapter_data)
        if default_chapter_serializer.is_valid():
            default_chapter_serializer.save()
        else:
            raise Exception("Error creating default chapter: " + str(default_chapter_serializer.errors))
            

class BookDelete(generics.DestroyAPIView):
    """Delete books (author-only)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user) 
    
    


# ========================
# Chapter managemnet views
# ========================
class ChapterListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        """List and create chapters for a specific book"""
        try:
            book = Book.objects.get(book_id=book_id)
            chapters = Chapter.objects.filter(book=book).order_by('chapter_number')
            serializer = ChapterSerializer(chapters, many=True)
            return Response(serializer.data)
        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, book_id):
        """Create new chapter with auto-incremented number"""
        try:
            book = Book.objects.get(book_id=book_id)
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
    """Retrieve, update and delete individual chapters"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id, chapter_id):
        """Retrieve a specific chapter"""
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
        """Update a specific chapter"""
        try:
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
        """Delete a specific chapter"""
        try:
            book = Book.objects.get(book_id=book_id)
            chapter = Chapter.objects.get(book=book, chapter_id=chapter_id)
            chapter.delete()
            return Response({"detail": "Chapter deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)
