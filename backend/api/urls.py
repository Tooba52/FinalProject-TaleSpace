from django.urls import path
from . import views


urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),

    # Books Endpoints
    path("books/", views.BookListCreate.as_view(), name="book-list-create"),  # List & Create books
    path("books/delete/<int:pk>/", views.BookDelete.as_view(), name="delete-book"),  # Delete a book

]