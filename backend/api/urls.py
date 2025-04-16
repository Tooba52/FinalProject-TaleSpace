from django.urls import path
from . import views

urlpatterns = [
    # Books Endpoints
    path("books/", views.BookListCreateView.as_view(), name="book-list-create"),  # List & Create books
    path("books/delete/<int:pk>/", views.BookDeleteView.as_view(), name="delete-book"),  # Delete a book
    path("books/<int:pk>/", views.BookRetrieveUpdateView.as_view(), name="book-detail"),  # Add this 

    # Chapter Endpoints
    path('books/<int:book_id>/chapters/', views.ChapterListCreateView.as_view(), name='chapter-list-create'), # List & Create chapters
    path('books/<int:book_id>/chapters/<int:chapter_id>/', views.ChapterRetrieveUpdateDestroyView.as_view(), name='chapter-detail'), # get, update, delete chapter

    #Favourite Endpoints
    path("books/<int:book_id>/is_favourite/", views.FavouriteCheckView.as_view(), name="check-favourite"), # check favourite
    path("books/<int:book_id>/add_favourite/", views.FavouriteAddView.as_view(), name="add-favourite"), # adding as favourite
    path("books/<int:book_id>/remove_favourite/", views.FavouriteRemoveView.as_view(), name="remove-favourite"), # removing favourite
    path('books/favourites/', views.FavouriteListView.as_view(), name='user-favourite-books'), # users favourited books

    #Profile Endpoints
    path('user/profile/<int:user_id>/', views.UserProfileView.as_view(), name='current-user-profile'),  # Current user
    path('public/profile/<int:user_id>/', views.PublicUserProfileView.as_view(), name='public-user-profile'), #other users profile
    path('user/delete-account/', views.UserDeleteView.as_view(), name='delete-account'), # delete user

    #Leaderboard Endpoints
    path('leaderboard/books/', views.TopBooksListView.as_view(), name='top-books'), 
    path('leaderboard/authors/', views.TopAuthorsListView.as_view(), name='top-authors'),
    path('leaderboard/genres/', views.TopGenresListView.as_view(), name='top-genres'),

    #Search Endpoint
    path('books/search/', views.BookSearchListView.as_view(), name='book-search'),  # search for book

    # Comments Endpoints
    path('books/<int:book_id>/comments/', views.CommentListView.as_view(), name='book-comments'),  # List comments for a book
    path('books/<int:book_id>/comments/create/', views.CommentCreateView.as_view(), name='create-comment'),  # Create a comment for a book
    path('comments/<int:comment_id>/delete/', views.CommentDeleteView.as_view(), name='delete-comment'),  # Delete a comment

    # Follow  Endpoints
    path('follow/<int:user_id>/', views.FollowCreateView.as_view(), name='follow-user'), # follow user
    path('unfollow/<int:user_id>/', views.FollowDestroyView.as_view(), name='unfollow-user'), # unfollow user
    path('check-follow/<int:user_id>/', views.FollowStatusView.as_view(), name='check-follow'), # check if following
    path('followers/<int:user_id>/', views.FollowerListView.as_view(), name='user-followers'), # follower count
    path('following/<int:user_id>/', views.FollowingListView.as_view(), name='user-following'), # following count

    #genre endpoints
    path('browse/<str:genreName>/page/<int:pageNumber>', views.GenreBookListView.as_view(), name='browse-genre'),
]
