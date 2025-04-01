from django.urls import path  # Import path function for routing
from . import views  # Import views from the current app

urlpatterns = [
    # Books Endpoints
    path("books/", views.BookListCreate.as_view(), name="book-list-create"),  # List & Create books
    path("books/delete/<int:pk>/", views.BookDelete.as_view(), name="delete-book"),  # Delete a book
]
