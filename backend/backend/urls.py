# Importing necessary modules
from django.contrib import admin  # Admin panel for managing the site
from django.urls import path, include  # URL routing for the project
from api.views import CreateUserView, UserProfileView # View for creating a user (registration)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # Views for handling JWT token operations

# URL patterns for the project
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/', include('api.urls')),

    path("api/user/profile/", UserProfileView.as_view(), name="user-profile"),

]


# This code is the URL routing configuration for a Django project that uses Django REST Framework (DRF) for handling API requests. It includes routes for user registration, JWT token generation and refresh, and the Django admin panel. The JWT-based authentication flow allows users to obtain access tokens and refresh them once they expire, ensuring secure access to protected API endpoints. Additionally, the api-auth/ route enables authentication via DRF's browsable API, providing easy testing during development.