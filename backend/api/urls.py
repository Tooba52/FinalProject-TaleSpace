from django.urls import path
from . import views

urlpatterns = [
    # Books Endpoints
    path("books/", views.BookListCreate.as_view(), name="book-list-create"),  # List & Create books
    path("books/delete/<int:pk>/", views.BookDelete.as_view(), name="delete-book"),  # Delete a book
     path("books/<int:pk>/", views.BookRetrieveUpdate.as_view(), name="book-detail"), # book details

    # Chapter endpoints
    path('books/<int:book_id>/chapters/', views.ChapterListCreateView.as_view(), name='chapter-list-create'), # List & Create chapters
    path('books/<int:book_id>/chapters/<int:chapter_id>/', views.ChapterDetailView.as_view(), name='chapter-detail'), # get, update, delete chapter
]
