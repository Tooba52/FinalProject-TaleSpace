from django.urls import path
from . import views
from .views import CreateUserView, LoginView

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("register/", CreateUserView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),  # New Login Route
]