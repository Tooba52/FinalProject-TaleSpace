from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import (ListCreateAPIView, RetrieveUpdateAPIView, DestroyAPIView)
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, BookSerializer, ChapterSerializer
from .models import Book, Chapter, Favourite, WebsiteUser
from django.core.paginator import Paginator
from django.db.models import Q, Sum, F
from collections import defaultdict

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
    

class PublicUserProfileView(APIView):
    """View for retrieving any user's public profile without follower data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = WebsiteUser.objects.get(pk=user_id)
            return Response({
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,  # Only include if you want to show emails
                'date_of_birth': user.date_of_birth,
                'date_joined': user.date_joined,
                # Removed follower-related fields
            })
        except WebsiteUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


# ========================
# Book managemnet views
# ========================
class BookListCreate(generics.ListCreateAPIView):
    """List and create books (user-specific)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    queryset = Book.objects.all()  # Base queryset required for ListCreateAPIView

    def get_filtered_queryset(self, request):
        """Handle all filtering logic"""
        queryset = Book.objects.all()
        
        # Filter by author if author_id parameter exists
        if author_id := request.query_params.get('author_id'):
            queryset = queryset.filter(author_id=author_id)
        
        # Filter by genre if genre parameter exists - only show public books
        if genre_name := request.query_params.get('genre'):
            genre_lower = genre_name.lower()
            queryset = queryset.filter(
                (Q(genres__contains=[genre_name.capitalize()]) | 
                Q(genres__contains=[genre_lower.capitalize()])),
                status='public'  # Only show public books when filtering by genre
            )
        
        return queryset
    
    def paginate_queryset(self, queryset, request):
        """Handle pagination logic separately"""
        page_number = request.GET.get('page', 1)
        page_size = 28
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page_number)
        
        return {
            'results': page_obj.object_list,
            'pagination_data': {
                'total_books': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': page_obj.number,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        }
    
    def get(self, request):
        # Get filtered queryset
        queryset = self.get_filtered_queryset(request)
        
        # Apply pagination
        paginated_data = self.paginate_queryset(queryset, request)
        
        # Serialize results
        serializer = BookSerializer(
            paginated_data['results'], 
            many=True
        )
        
        # Return response with pagination metadata
        return Response({
            'results': serializer.data,
            'count': paginated_data['pagination_data']['total_books'],
            'total_pages': paginated_data['pagination_data']['total_pages'],
            'current_page': paginated_data['pagination_data']['current_page'],
            'next': paginated_data['pagination_data']['has_next'],
            'previous': paginated_data['pagination_data']['has_previous']
        })

    def perform_create(self, serializer):
        book = serializer.save(
            author=self.request.user,
            author_name=self.request.user.first_name
        )
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
            


class BookRetrieveUpdate(RetrieveUpdateAPIView):
    """
    Retrieve or update a book instance.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return []  # No auth required for viewing
        return [IsAuthenticated()]  # Auth required for updates

    def get_queryset(self):
        if self.request.method == 'GET':
            # Allow viewing public books by anyone
            return Book.objects.filter(
                Q(status='public') | 
                Q(author=self.request.user)
            )
        # For updates, only show user's own books
        return Book.objects.filter(author=self.request.user)
    


class BookDelete(generics.DestroyAPIView):
    """Delete books (author-only)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user) 
    



# ========================
# Favourite managemnet views
# ========================

class CheckFavouriteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        is_favorite = Favourite.objects.filter(user=request.user, book_id=book_id).exists()
        return Response({"is_favorite": is_favorite})

class AddFavouriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        favorite, created = Favourite.objects.get_or_create(
            user=request.user,
            book_id=book_id
        )
        if created:
            return Response({"status": "added"})
        return Response({"status": "already_exists"})

class RemoveFavouriteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, book_id):
        deleted, _ = Favourite.objects.filter(
            user=request.user,
            book_id=book_id
        ).delete()
        if deleted:
            return Response({"status": "removed"})
        return Response({"status": "not_found"})
    

class FavouriteBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favourite.objects.filter(user=request.user).select_related('book')
        books = [fav.book for fav in favorites]
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

# ========================
# Chapter managemnet views
# ========================
class ChapterListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        """List published chapters for a specific book"""
        try:
            book = Book.objects.get(book_id=book_id)
            # Only show published chapters for read view
            if request.query_params.get('published_only'):
                chapters = Chapter.objects.filter(
                    book=book, 
                    chapter_status='published'
                ).order_by('chapter_number')
            else:
                # For authors editing their book, show all chapters
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
        try:
            chapter = Chapter.objects.get(book_id=book_id, chapter_id=chapter_id)
            
            # === View-count logic (added to existing view) === #
            if chapter.chapter_status == 'published':
                session_key = f'book_{book_id}_viewed'
                if not request.session.get(session_key):
                    Book.objects.filter(book_id=book_id).update(view_count=F('view_count') + 1)
                    request.session[session_key] = True
            # === End view-count logic === #
            
            serializer = ChapterSerializer(chapter)
            return Response(serializer.data)
        
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=404)

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


# Leaderboard Views
class TopBooksView(APIView):
    """Top 10 most-viewed public books"""
    permission_classes = [AllowAny]  # Public access

    def get(self, request):
        books = Book.objects.filter(status='public').order_by('-view_count')[:10]
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)


class TopAuthorsView(APIView):
    def get(self, request):
        top_authors = (
            Book.objects.filter(status='public')
            .values('author_id')
            .annotate(
                total_views=Sum('view_count'),
                first_name=F('author__first_name')  # Only get first name
            )
            .order_by('-total_views')[:7]
        )
        
        # Simplified response with just first name
        formatted_authors = [{
            'author_id': author['author_id'],
            'author_name': author['first_name'],  # Just the first name
            'total_views': author['total_views']
        } for author in top_authors]
        
        return Response(formatted_authors)

class TopGenresView(APIView):
    """Top 10 genres by total book views (handles JSONField)"""
    permission_classes = [AllowAny]

    def get(self, request):
        genre_views = defaultdict(int)
        for book in Book.objects.filter(status='public'):
            for genre in book.genres:  # Loop through JSON list
                genre_views[genre] += book.view_count
        
        top_genres = sorted(genre_views.items(), key=lambda x: x[1], reverse=True)[:10]
        return Response([{"genre": g, "views": v} for g, v in top_genres])