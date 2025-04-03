from django.urls import path  # Import path function for routing
from . import views  # Import views from the current app

urlpatterns = [
    # Books Endpoints
    path("books/", views.BookListCreate.as_view(), name="book-list-create"),  # List & Create books
    path("books/delete/<int:pk>/", views.BookDelete.as_view(), name="delete-book"),  # Delete a book
    # path("books/<int:book_id>/content/", views.BookContentView.as_view(), name="book-content"),  # Fetch and update content

    # For getting all chapters of a specific book, and creating chapters for a specific book
    path('books/<int:book_id>/chapters/', views.ChapterListCreateView.as_view(), name='chapter-list-create'),
    
    # For getting, updating, or deleting a specific chapter by chapter_number
    path('books/<int:book_id>/chapters/<int:chapter_number>/', views.ChapterDetailView.as_view(), name='chapter-detail'),

# Books should call chapter, then chapter should call content. So the URL will look like this books/<int:book_id>/chapter/content
]
