from django.urls import path
from . import views

urlpatterns = [
    # Books Endpoints
    path("books/", views.BookListCreate.as_view(), name="book-list-create"),  # List & Create books
    path("books/delete/<int:pk>/", views.BookDelete.as_view(), name="delete-book"),  # Delete a book
    path("books/<int:pk>/", views.BookRetrieveUpdate.as_view(), name="book-detail"),  # Add this 
    path('books/search/', views.BookSearch.as_view(), name='book-search'),  # New

    # Chapter endpoints
    path('books/<int:book_id>/chapters/', views.ChapterListCreateView.as_view(), name='chapter-list-create'), # List & Create chapters
    path('books/<int:book_id>/chapters/<int:chapter_id>/', views.ChapterDetailView.as_view(), name='chapter-detail'), # get, update, delete chapter

    #Favourite endpoints
    path("books/<int:book_id>/is_favourite/", views.CheckFavouriteView.as_view(), name="check-favourite"), # check favourite
    path("books/<int:book_id>/add_favourite/", views.AddFavouriteView.as_view(), name="add-favourite"), # adding as favourite
    path("books/<int:book_id>/remove_favourite/", views.RemoveFavouriteView.as_view(), name="remove-favourite"), # removing favourite
    path('books/favourites/', views.FavouriteBooksView.as_view(), name='user-favourite-books'), # users favourited books

    #Profile endpointd
    path('user/profile/<int:user_id>/', views.UserProfileView.as_view()),  # Current user
    path('public/profile/<int:user_id>/', views.PublicUserProfileView.as_view(), name='public-user-profile'),

    #Leaderboards
    path('leaderboard/books/', views.TopBooksView.as_view(), name='top-books'),
    path('leaderboard/authors/', views.TopAuthorsView.as_view(), name='top-authors'),
    path('leaderboard/genres/', views.TopGenresView.as_view(), name='top-genres'),
]
