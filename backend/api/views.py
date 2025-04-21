# Code resued from: 
# Author: Tech With Tim
# Video Title: Django & React Web App Tutorial - Authentication, Databases, Deployment & More...
# Video Link:  https://www.youtube.com/watch?v=c-QsfbznSXI 
# Code reused for views were based of Tims view template, most views were mostly editted and changed to suit my site
# Specific lines have been mentioned below

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
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
from django.db.models import Q, Sum, F
from collections import defaultdict
from django.contrib.auth import logout

User = get_user_model()


# ================================================

# custom pagination with page number support
class CustomPagination(PageNumberPagination):
    page_size = 28
    page_size_query_param = 'page_size'
    max_page_size = 100

    # return custom paginated response
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
        })

# ================================================


# Code reused Lines - 52-55
# handle user registration
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 


# retrieve and update authenticated user's profile
class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated] 
    
    # Return the current user's profile data
    def get(self, request):
        user = request.user # get current user
        serializer = UserSerializer(user) # serialize user data
        return Response(serializer.data)  # return user profile
    
    # Update profile fields or change password
    def put(self, request):
        user = request.user
        print(f"Updating profile for {user.email}. Incoming data:", request.data)
        data = request.data.copy()
        
         # handle password change if provided
        if 'current_password' in data and 'new_password' in data:
            if not user.check_password(data['current_password']): # check current password
                return Response(
                    {"error": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(data['new_password']) # set new password
            user.save()
            data.pop('current_password') # remove password fields
            data.pop('new_password')
        
        # update other profile fields
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) # return updated data
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # return errors
    

# view for retrieving any user's public profile without follower data
class PublicUserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated] 
    
    # Fetches and returns public profile data
    def get(self, request, user_id):
        try:
            user = WebsiteUser.objects.get(pk=user_id)  # fetch user
            return Response({
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,  
                'date_of_birth': user.date_of_birth,
                'date_joined': user.date_joined,
            })
        except WebsiteUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404) # handle user not found


#================================================

# view for deleting a user's account
class UserDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated] 

    # retrieving and deleting user
    def delete(self, request):
        try:
            user = request.user # get the current logged-in user
            current_password = request.data.get('current_password') # get current password from request
            
            if not user.check_password(current_password): # check if the password is correct
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
                status=status.HTTP_200_OK  # return success message
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)}, # handle any errors during the process
                status=status.HTTP_400_BAD_REQUEST
            )
# ================================================

# Book list and creating
class BookListCreateView(generics.ListCreateAPIView):
    """List and create books (user-specific)"""
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = CustomPagination
    queryset = Book.objects.all()

    # Handle all filtering logic with book visibility
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # filter by author_id if provided
        if author_id := self.request.query_params.get('author_id'):
             # show all books for own account
            if str(author_id) == str(self.request.user.user_id):  
                return queryset.filter(author_id=author_id).order_by('-created_at') # show only public books for others
            
            # For other users, only show public books
            return queryset.filter(
                author_id=author_id,
                status='public'
            ).order_by('-created_at')
        
        # filter by genre if provided, show only public books
        if genre_name := self.request.query_params.get('genre'):
            genre_lower = genre_name.lower()
            return queryset.filter(
                (Q(genres__contains=[genre_name.capitalize()]) | 
                 Q(genres__contains=[genre_lower.capitalize()])),
                status='public'
            ).order_by('-created_at')
        
        # default to all public books
        return queryset.filter(status='public').order_by('-created_at')

    # create a new book and its default first chapter
    def perform_create(self, serializer):
        book = serializer.save(
            author=self.request.user,
            author_name=self.request.user.first_name
        )
        self.create_default_chapter(book)

    # Create default first chapter for new books
    def create_default_chapter(self, book):
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

    # override to handle special list behavior if needed
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# Retrieve or update a book.
class BookRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Book.objects.all() # fetch all books by default
    serializer_class = BookSerializer
    
    # no authentication for viewing, requires auth for updates
    def get_permissions(self):
        if self.request.method == 'GET':
            return []  # no auth required for viewing
        return [IsAuthenticated()]  # Auth required for updates

    # filter books based on visibility and ownership
    def get_queryset(self):
        if self.request.method == 'GET':
            # allow anyone to view public books or their own books
            return Book.objects.filter(
                Q(status='public') | 
                Q(author=self.request.user)
            )
         # for updates, only show the user's own books
        return Book.objects.filter(author=self.request.user)
    
    # handle book update requests
    def put(self, request, *args, **kwargs):
        print("Incoming data:", request.data)  # Log incoming data
        print("Files:", request.FILES)  # Log uploaded files
        
        instance = self.get_object() # get the book instance to update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        print("Serializer data:", serializer.initial_data)  # Log 
        serializer.is_valid(raise_exception=True)  # validate 
        self.perform_update(serializer) # update 
        
        return Response(serializer.data) # return updated data
    

# Delete books (author-only)
class BookDeleteView(DestroyAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        return Book.objects.filter(author=self.request.user)  # filter books by the user


# ========================

# Favourite managemnet views
class FavouriteCheckView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    # check if the user has marked this book as a favourite
    def get(self, request, book_id):
        is_favourite = Favourite.objects.filter(user=request.user, book_id=book_id).exists() # check for favourite
        return Response({"is_favourite": is_favourite}) # return the result
 

# view to add a book to favourites
class FavouriteAddView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    # Adds a book to user's favourites or returns existing status
    def post(self, request, book_id):
        created = Favourite.objects.get_or_create(
            user=request.user, # use current user
            book_id=book_id # use book ID to identify the book
        )
        if created: 
            return Response({"status": "added"}) # book was added to favourites
        return Response({"status": "already_exists"}) # book is already in favourites


# view to remove a book from favourites
class FavouriteRemoveView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    # remove a book from the user's favourites
    def delete(self, request, book_id):
        deleted, _ = Favourite.objects.filter(
            user=request.user, # use current user
            book_id=book_id # use book ID to identify the book
        ).delete()
        if deleted:
            return Response({"status": "removed"})  # book was removed from favourites
        return Response({"status": "not_found"})  # book was not found in favourites
    

# view to list the user's favourited books
class FavouriteListView(ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    # fetch the books that are favourited by the current user
    def get_queryset(self):
        # get the IDs of all books that the user has favourited
        book_ids = Favourite.objects.filter(
            user=self.request.user
        ).values_list('book_id', flat=True)
        
        # fetch the books that are favourited and are public
        queryset = Book.objects.filter(
            book_id__in=book_ids,
            status='public'
        ).order_by('book_id')

        return queryset
    


# ================================================
# Chapter managemnet views
class ChapterListCreateView(ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # List published chapters for a specific book
    def get(self, request, book_id):
        try:
            book = Book.objects.get(book_id=book_id)
            if request.query_params.get('published_only'):
                # show only published chapters if requested
                chapters = Chapter.objects.filter(
                    book=book, 
                    chapter_status='published'
                ).order_by('chapter_number')
            else:
                # show all chapters for the author
                chapters = Chapter.objects.filter(book=book).order_by('chapter_number')
                
            serializer = ChapterSerializer(chapters, many=True)
            return Response(serializer.data)
        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

    # create a new chapter with next chapter number
    def post(self, request, book_id):
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


# Retrieve, update and delete individual chapters
class ChapterRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # retrieve a specidic books chapter 
    def get(self, request, book_id, chapter_id):
        try:
            # fetch the requested chapter by book and chapter ID
            chapter = Chapter.objects.get(book_id=book_id, chapter_id=chapter_id)
            
            # increase view count only once per session for published chapters
            if chapter.chapter_status == 'published':
                session_key = f'book_{book_id}_viewed'
                if not request.session.get(session_key):
                    Book.objects.filter(book_id=book_id).update(view_count=F('view_count') + 1)
                    request.session[session_key] = True
            
            # serialize and return chapter data
            serializer = ChapterSerializer(chapter)
            return Response(serializer.data)
        
        except Chapter.DoesNotExist:
            # return 404 if chapter not found
            return Response({"detail": "Chapter not found."}, status=404)

    # Update a specific chapter
    def put(self, request, book_id, chapter_id):
        try:
             # ensure book exists
            book = Book.objects.get(book_id=book_id)
            # fetch the chapter belonging to the book
            chapter = Chapter.objects.get(book=book, chapter_id=chapter_id)
            serializer = ChapterSerializer(chapter, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()  # save updated data
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)

    # Delete a specific chapter
    def delete(self, request, book_id, chapter_id):
        try:
            # fetch the book and chapter
            book = Book.objects.get(book_id=book_id)
            chapter = Chapter.objects.get(book=book, chapter_id=chapter_id)
            chapter.delete() #delete
            return Response({"detail": "Chapter deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        except Chapter.DoesNotExist:
            return Response({"detail": "Chapter not found."}, status=status.HTTP_404_NOT_FOUND)


# ================================================

# Top 10 most-viewed public books
class TopBooksListView(ListAPIView):
    permission_classes = [AllowAny]  

    # # fetch top 10 books ordered by view count
    def get(self, request):
        books = Book.objects.filter(status='public').order_by('-view_count')[:10]
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)


 # Top 10 most-viewed authors
class TopAuthorsListView(ListAPIView):

    # fetch top 10 authors by summing the views of all their books
    def get(self, request):
        top_authors = (
            Book.objects.filter(status='public')
            .values('author_id')
            .annotate(
                total_views=Sum('view_count'),
                first_name=F('author__first_name') 
            )
            .order_by('-total_views')[:7] # limit to top 7 authors
        )
        
        # format the data for response
        formatted_authors = [{
            'author_id': author['author_id'],
            'author_name': author['first_name'], 
            'total_views': author['total_views']
        } for author in top_authors]
        
        return Response(formatted_authors)


 # Top 10 most-viewed genres
class TopGenresListView(ListAPIView):
    permission_classes = [AllowAny]

    # fetch top 10 genres by summing the views of all their books
    def get(self, request):
        genre_views = defaultdict(int)

        # iterate through public books and count views per genre
        for book in Book.objects.filter(status='public'):
            for genre in book.genres: 
                genre_views[genre] += book.view_count
        
        # sort genres by views and get top 10
        top_genres = sorted(genre_views.items(), key=lambda x: x[1], reverse=True)[:10]

        # prepare and return response
        return Response([{"genre": g, "views": v} for g, v in top_genres])


# ================================================

# View for searching public books by title
class BookSearchListView(ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    pagination_class = CustomPagination
    
    # Returns public books matching title search query
    def get_queryset(self):
        search_query = self.request.query_params.get('q', '').strip()
        if not search_query:
            return Book.objects.none()
            
        # Search only in book titles 
        return Book.objects.filter(
            title__icontains=search_query,
            status='public'
        ).order_by('-created_at')
    


# ================================================

# Fetch all comments for a specific book
class CommentListView(ListAPIView):
    permission_classes = [IsAuthenticated]

    # Retrieves all comments for a specific book
    def get(self, request, *args, **kwargs):
        book_id = kwargs.get('book_id')  # retrieve book_id from the URL
        
        if book_id:
            # fetch all comments linked to the book using its ID
            comments = Comment.objects.filter(comment_book__book_id=book_id)  # Filter by book_id
        else:
            # return error if book_id is not provided
            return Response({'detail': 'Book ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # serialize and return the list of comments
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    

# Create a new comment for a book
class CommentCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    # # Handles comment creation for a specific book
    def post(self, request, *args, **kwargs):
        book_id = kwargs.get('book_id')  # get book_id from the URL parameters

        try:
            # try to retrieve the book object based on the given book_id
            book = Book.objects.get(book_id=book_id) 
        except Book.DoesNotExist:
            # if the book doesn't exist, return a 404 error
            return Response({'detail': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

       # initialize the serializer with the request data
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            # save the comment and attach the current user and book to it
            serializer.save(comment_user=request.user, comment_book=book)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # if the serializer isn't valid, return the validation errors
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
# Delete an existing comment
class CommentDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    # Handles comment deletion with permission 
    def delete(self, request, *args, **kwargs):
        comment_id = kwargs.get('comment_id')  # get the comment_id from the URL
        
        try:
            # try to fetch the comment object from the database
            comment = Comment.objects.get(comment_id=comment_id)
        except Comment.DoesNotExist:
            # return a 404 response if comment doesn't exist
            return Response({'detail': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

        # ensure that only the user who wrote the comment can delete it
        if comment.comment_user != request.user:
            return Response({'detail': 'You do not have permission to delete this comment'}, status=status.HTTP_403_FORBIDDEN)

        # delete the comment if permission check passes
        comment.delete()
        return Response({'detail': 'Comment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    

# ================================================

# Follow another user
class FollowCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    # Creates a follow relationship between users
    def post(self, request, user_id):
        try:
            # try to find the user that is to be followed
            user_to_follow = WebsiteUser.objects.get(pk=user_id)
            
            # prevent users from following themselves
            if request.user == user_to_follow:
                return Response(
                    {"detail": "You cannot follow yourself."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # create a follow relationship if it doesn't already exist
            Follow.objects.get_or_create(
                follower=request.user,
                followed=user_to_follow
            )
            
            # return a success message
            return Response(
                {"detail": f"Successfully followed {user_to_follow.email}"},
                status=status.HTTP_201_CREATED
            )
            
        except WebsiteUser.DoesNotExist:
            # return error if target user doesn't exist
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

# Unfollow a use
class FollowDestroyView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    # Handles unfollowing
    def delete(self, request, user_id):
        try:
            # try to find the user that is to be unfollowed
            user_to_unfollow = WebsiteUser.objects.get(pk=user_id)
            
            # delete the follow relationship if it exists
            deleted_count, _ = Follow.objects.filter(
                follower=request.user,
                followed=user_to_unfollow
            ).delete()
            
            if deleted_count > 0:
                # return success message if the user was successfully unfollowed
                return Response(
                    {"detail": f"Successfully unfollowed {user_to_unfollow.email}"},
                    status=status.HTTP_200_OK
                )
            # return error message if the user was not following the target
            return Response(
                {"detail": "You were not following this user."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except WebsiteUser.DoesNotExist:
            # return error if the target user does not exist
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

# Check if current user follows another user
class FollowStatusView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    # Checks and returns whether the current user follows the specified target user
    def get(self, request, user_id):
        try:
            # try to find the target user by their user_id
            target_user = WebsiteUser.objects.get(pk=user_id)
            # check if the logged-in user is following the target user
            is_following = Follow.objects.filter(
                follower=request.user,
                followed=target_user
            ).exists() # returns True if the follow relationship exists
            
            # return the follow status along with the target user ID
            return Response({
                "is_following": is_following,
                "target_user_id": user_id
            })
            
        except WebsiteUser.DoesNotExist:
            # return error if the target user does not exist
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

# List all followers of a user
class FollowerListView(ListAPIView):
    permission_classes = [IsAuthenticated]

    # retrieves all followers of user
    def get(self, request, user_id):
        try:
            # Attempt to retrieve the user with the provided user_id
            user = WebsiteUser.objects.get(pk=user_id)
            # Fetch all followers of the user using the related_name from the Follow model
            followers = user.followers.all()  
            # Prepare a list of follower data
            follower_data = [{
                'user_id': f.follower.pk,
                'email': f.follower.email,
                'first_name': f.follower.first_name,
                'last_name': f.follower.last_name
            } for f in followers]
            
            # Return the follower data along with the total count
            return Response({
                "count": len(follower_data),
                "followers": follower_data
            })
            
        except WebsiteUser.DoesNotExist:
            # Return error if the user does not exist
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


# List all users a person is following
class FollowingListView(ListAPIView):
    permission_classes = [IsAuthenticated]

    # retrieves all users following
    def get(self, request, user_id):
        try:
            #  Attempt to retrieve the user with the provided user_id
            user = WebsiteUser.objects.get(pk=user_id)
            # Fetch all users that the current user is following using the related_name from the Follow model
            following = user.following.all() 
            # Prepare a list of following data
            following_data = [{
                'user_id': f.followed.pk,
                'email': f.followed.email,
                'first_name': f.followed.first_name,
                'last_name': f.followed.last_name
            } for f in following]
            
            # Return the following data along with the total count
            return Response({
                "count": len(following_data), # Total number of users the current user is following
                "following": following_data # List of users being followed
            })
            
        except WebsiteUser.DoesNotExist:
            # Return error if the user does not exist
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
#================================================

# Specialized view for browsing books by genre
class GenreBookListView(ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    # Filters public books by genre (with URL-friendly genre name handling)
    def get_queryset(self):
        # Start by querying all public books, ordered by book_id
        queryset = Book.objects.filter(status='public').order_by('book_id')

         # Retrieve the genre name from the URL
        genre_name = self.kwargs.get('genreName')
        if genre_name:
            # Convert URL-encoded genre name (hyphenated) back to display format
            genre_name = genre_name.replace('-', ' ')
            
            # Handle special cases for genre names that are URL-friendly
            genre_mapping = {
                'sci fi': 'Sci-Fi',
                'fairy tale': 'Fairy Tale',
                'post apocalyptic': 'Post-Apocalyptic',
                'slice of life': 'Slice of Life'
            }
            
           # Check if the genre name is in the special mapping
            normalized_name = genre_name.lower()
            if normalized_name in genre_mapping:
                genre_name = genre_mapping[normalized_name]
            else:
                # If not a special case, capitalize genre name normally
                genre_name = ' '.join(word.capitalize() for word in genre_name.split())
            
            # Filter books based on the genres list containing the genre_name
            queryset = queryset.filter(genres__contains=[genre_name])
        return queryset

    # Handles custom pagination using pageNumber from URL
    def paginate_queryset(self, queryset):
        # Retrieve the page number from the URL kwargs (defaults to 1)
        page_number = self.kwargs.get('pageNumber', 1)

       # Create a mutable copy of the request's GET parameters to modify page number
        request = self.request._request
        request.GET = request.GET.copy()
        request.GET._mutable = True
        request.GET['page'] = str(page_number) # Set the page number in the request

        # Let Django Rest Framework handle the actual pagination
        return super().paginate_queryset(queryset)
