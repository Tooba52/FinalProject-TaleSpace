from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateAPIView,
    DestroyAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView
)
from .serializers import UserSerializer, BookSerializer, ChapterSerializer, CommentSerializer
from .models import Book, Chapter, Favourite, WebsiteUser, Comment, Follow
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator
from django.db.models import Q, Sum, F
from collections import defaultdict
from django.contrib.auth import logout
import logging


User = get_user_model()



# ========================
# Pagination 
# ========================
class CustomPagination(PageNumberPagination):
    page_size = 28
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
        })

# ========================
# user managemnet views
# ========================

#Handle user registration
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow anyone to register


# Retrieve authenticated user's profile
class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data) 
    
    def put(self, request):
        user = request.user
        print(f"Updating profile for {user.email}. Incoming data:", request.data)
        data = request.data.copy()
        
        # Handle password change if included
        if 'current_password' in data and 'new_password' in data:
            if not user.check_password(data['current_password']):
                return Response(
                    {"error": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(data['new_password'])
            user.save()
            # Remove password fields from data so they don't get included in regular update
            data.pop('current_password')
            data.pop('new_password')
        
        # Handle regular profile updates
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PublicUserProfileView(generics.RetrieveAPIView):
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



#delete
class UserDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            user = request.user
            current_password = request.data.get('current_password')
            
            if not user.check_password(current_password):
                return Response(
                    {"error": "Incorrect password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Delete the user
            user.delete()
            
            # Logout the user
            logout(request)
            
            return Response(
                {"detail": "Account successfully deleted"},
                status=status.HTTP_200_OK  # Changed from 204 to 200 to include message
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
# ========================
# Book managemnet views
# ========================
class BookListCreateView(generics.ListCreateAPIView):
    """List and create books (user-specific)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = Book.objects.all()

    def get_queryset(self):
        """Handle all filtering logic with proper book visibility"""
        queryset = super().get_queryset()
        
        # Filter by author if author_id parameter exists
        if author_id := self.request.query_params.get('author_id'):
            # Always show ALL books when user is viewing their own books
            if str(author_id) == str(self.request.user.user_id):  # Changed to user_id
                return queryset.filter(author_id=author_id).order_by('-created_at')
            
            # For other users, only show public books
            return queryset.filter(
                author_id=author_id,
                status='public'
            ).order_by('-created_at')
        
        # Filter by genre if genre parameter exists - only show public books
        if genre_name := self.request.query_params.get('genre'):
            genre_lower = genre_name.lower()
            return queryset.filter(
                (Q(genres__contains=[genre_name.capitalize()]) | 
                 Q(genres__contains=[genre_lower.capitalize()])),
                status='public'
            ).order_by('-created_at')
        
        # Default case: show all public books if no filters
        return queryset.filter(status='public').order_by('-created_at')


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
            'chapter_title': 'Chapter 1',
            'chapter_content': ' ',
            'chapter_status': 'draft',
            'book': book.book_id
        }
        default_chapter_serializer = ChapterSerializer(data=default_chapter_data)
        if default_chapter_serializer.is_valid():
            default_chapter_serializer.save()
        else:
            raise ValidationError(
                "Error creating default chapter: " + 
                str(default_chapter_serializer.errors)
            )

    # Optional: Override list() if you need special handling
    def list(self, request, *args, **kwargs):
        # You can add debug prints here if needed
        return super().list(request, *args, **kwargs)
            


class BookRetrieveUpdateView(RetrieveUpdateAPIView):
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
    


class BookDeleteView(DestroyAPIView):
    """Delete books (author-only)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user) 
    




# ========================
# Favourite managemnet views
# ========================

class FavouriteCheckView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        is_favourite = Favourite.objects.filter(user=request.user, book_id=book_id).exists()
        return Response({"is_favourite": is_favourite})

class FavouriteAddView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        favourite, created = Favourite.objects.get_or_create(
            user=request.user,
            book_id=book_id
        )
        if created:
            return Response({"status": "added"})
        return Response({"status": "already_exists"})

class FavouriteRemoveView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, book_id):
        deleted, _ = Favourite.objects.filter(
            user=request.user,
            book_id=book_id
        ).delete()
        if deleted:
            return Response({"status": "removed"})
        return Response({"status": "not_found"})
    

class FavouriteListView(ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        print(f"\n=== FavouriteListView Debug ===")
        print(f"Requested page: {self.request.GET.get('page', '1')}")
        print(f"User: {self.request.user}")
        
        # More efficient query using values_list
        book_ids = Favourite.objects.filter(
            user=self.request.user
        ).values_list('book_id', flat=True)
        
        queryset = Book.objects.filter(
            book_id__in=book_ids,
            status='public'
        ).order_by('book_id')
        
        print(f"Total favorited books found: {queryset.count()}")
        return queryset

    def paginate_queryset(self, queryset):
        print("\n=== Pagination Debug ===")
        page = super().paginate_queryset(queryset)
        
        if page is not None:
            # Correct way to access pagination info
            print(f"Page number: {self.paginator.page.number}")
            print(f"Items on page: {len(page)}")
            print(f"Total pages: {self.paginator.page.paginator.num_pages}")  # Fixed this line
            if page:
                print(f"First item ID: {page[0].book_id}")
                print(f"Last item ID: {page[-1].book_id}")
        
        return page
    


# ========================
# Chapter managemnet views
# ========================
class ChapterListCreateView(ListCreateAPIView):
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


class ChapterRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
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


# ========================
# Leaderboard managemnet views
# ========================
class TopBooksListView(ListAPIView):
    """Top 10 most-viewed public books"""
    permission_classes = [AllowAny]  # Public access

    def get(self, request):
        books = Book.objects.filter(status='public').order_by('-view_count')[:10]
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)


class TopAuthorsListView(ListAPIView):
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

class TopGenresListView(ListAPIView):
    """Top 10 genres by total book views (handles JSONField)"""
    permission_classes = [AllowAny]

    def get(self, request):
        genre_views = defaultdict(int)
        for book in Book.objects.filter(status='public'):
            for genre in book.genres:  # Loop through JSON list
                genre_views[genre] += book.view_count
        
        top_genres = sorted(genre_views.items(), key=lambda x: x[1], reverse=True)[:10]
        return Response([{"genre": g, "views": v} for g, v in top_genres])


# ========================
# Search managemnet views
# ========================
class BookSearchListView(ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    pagination_class = CustomPagination  # Add your custom pagination
    
    def get_queryset(self):
        search_query = self.request.query_params.get('q', '').strip()
        if not search_query:
            return Book.objects.none()  # Return empty if no query
            
        return Book.objects.filter(
            Q(title__icontains=search_query) | 
            Q(author_name__icontains=search_query) |
            Q(description__icontains=search_query),
            status='public'
        ).order_by('-created_at').distinct()
    


# ========================
# Comment managemnet views
# ========================
class CommentListView(ListAPIView):
    """Fetch all comments for a specific book."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        book_id = kwargs.get('book_id')  # Assuming the book_id is passed in the URL
        
        if book_id:
            comments = Comment.objects.filter(comment_book__book_id=book_id)  # Filter by book_id
        else:
            return Response({'detail': 'Book ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    


class CommentCreateView(generics.CreateAPIView):
    """Create a new comment for a book."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        book_id = kwargs.get('book_id')  # Get book_id from the URL

        try:
            book = Book.objects.get(book_id=book_id)  # Find the book by its ID
        except Book.DoesNotExist:
            return Response({'detail': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create a new comment instance
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(comment_user=request.user, comment_book=book)  # Save with logged-in user and selected book
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Log the errors from serializer
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class CommentDeleteView(DestroyAPIView):
    """Delete an existing comment."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        comment_id = kwargs.get('comment_id')  # Get comment_id from the URL
        
        try:
            comment = Comment.objects.get(comment_id=comment_id)
        except Comment.DoesNotExist:
            return Response({'detail': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the current user is the author of the comment
        if comment.comment_user != request.user:
            return Response({'detail': 'You do not have permission to delete this comment'}, status=status.HTTP_403_FORBIDDEN)

        # Delete the comment
        comment.delete()
        return Response({'detail': 'Comment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    

# ========================
# Follow managemnet views
# ========================
class FollowCreateView(generics.CreateAPIView):
    """Follow another user"""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            user_to_follow = WebsiteUser.objects.get(pk=user_id)
            
            # Prevent self-follow
            if request.user == user_to_follow:
                return Response(
                    {"detail": "You cannot follow yourself."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create follow relationship
            Follow.objects.get_or_create(
                follower=request.user,
                followed=user_to_follow
            )
            
            return Response(
                {"detail": f"Successfully followed {user_to_follow.email}"},
                status=status.HTTP_201_CREATED
            )
            
        except WebsiteUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class FollowDestroyView(DestroyAPIView):
    """Unfollow a user"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            user_to_unfollow = WebsiteUser.objects.get(pk=user_id)
            
            # Delete follow relationship if it exists
            deleted_count, _ = Follow.objects.filter(
                follower=request.user,
                followed=user_to_unfollow
            ).delete()
            
            if deleted_count > 0:
                return Response(
                    {"detail": f"Successfully unfollowed {user_to_unfollow.email}"},
                    status=status.HTTP_200_OK
                )
            return Response(
                {"detail": "You were not following this user."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except WebsiteUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class FollowStatusView(generics.RetrieveAPIView):
    """Check if current user follows another user"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            target_user = WebsiteUser.objects.get(pk=user_id)
            is_following = Follow.objects.filter(
                follower=request.user,
                followed=target_user
            ).exists()
            
            return Response({
                "is_following": is_following,
                "target_user_id": user_id
            })
            
        except WebsiteUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class FollowerListView(ListAPIView):
    """List all followers of a user"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = WebsiteUser.objects.get(pk=user_id)
            followers = user.followers.all()  # Using related_name from Follow model
            follower_data = [{
                'user_id': f.follower.pk,
                'email': f.follower.email,
                'first_name': f.follower.first_name,
                'last_name': f.follower.last_name
            } for f in followers]
            
            return Response({
                "count": len(follower_data),
                "followers": follower_data
            })
            
        except WebsiteUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class FollowingListView(ListAPIView):
    """List all users a person is following"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = WebsiteUser.objects.get(pk=user_id)
            following = user.following.all()  # Using related_name from Follow model
            following_data = [{
                'user_id': f.followed.pk,
                'email': f.followed.email,
                'first_name': f.followed.first_name,
                'last_name': f.followed.last_name
            } for f in following]
            
            return Response({
                "count": len(following_data),
                "following": following_data
            })
            
        except WebsiteUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        




class GenreBookListView(ListAPIView):
    """
    Specialized view for browsing books by genre
    """
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Book.objects.filter(status='public').order_by('book_id')

        genre_name = self.kwargs.get('genreName')
        if genre_name:
            genre_lower = genre_name.lower()
            queryset = queryset.filter(
                Q(genres__contains=[genre_name.capitalize()]) | 
                Q(genres__contains=[genre_lower.capitalize()])
            )
        return queryset

    def paginate_queryset(self, queryset):
        # Get page number from URL kwargs
        page_number = self.kwargs.get('pageNumber', 1)

        # Create a new request with the modified page number
        request = self.request._request
        request.GET = request.GET.copy()
        request.GET._mutable = True
        request.GET['page'] = str(page_number)

        # Let DRF handle the pagination
        return super().paginate_queryset(queryset)
