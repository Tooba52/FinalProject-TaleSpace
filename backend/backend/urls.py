# Importing necessary modules
from django.contrib import admin  # Admin panel for managing the site
from django.urls import path, include  # URL routing for the project
from api.views import CreateUserView, UserProfileView # View for creating a user (registration)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # Views for handling JWT token operations

# URL patterns for the project
urlpatterns = [
    # Admin panel URL - This allows you to access Django's built-in admin interface
    path("admin/", admin.site.urls),  # The admin panel can be accessed via '/admin/' URL
    
    # URL for user registration, linked to the 'CreateUserView'
    path("api/user/register/", CreateUserView.as_view(), name="register"),  # Handles user registration through POST request
    
    # URL for obtaining an authentication token using JWT
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),  # Provides the initial access and refresh tokens for user authentication
    
    # URL for refreshing the authentication token (JWT refresh flow)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),  # Handles refreshing of the JWT token to extend user session
    
    # URL for API authentication using DRF's browsable API (optional)
    path("api-auth/", include("rest_framework.urls")),  # Allows the user to authenticate through DRF's built-in authentication views
    
    # Including other app's URLs (API-related routes in this case)
    path("api/", include("api.urls")),  # Routes all other API-related endpoints to the 'api.urls' module

    path("api/user/profile/", UserProfileView.as_view(), name="user-profile"),

]


# This code is the URL routing configuration for a Django project that uses Django REST Framework (DRF) for handling API requests. It includes routes for user registration, JWT token generation and refresh, and the Django admin panel. The JWT-based authentication flow allows users to obtain access tokens and refresh them once they expire, ensuring secure access to protected API endpoints. Additionally, the api-auth/ route enables authentication via DRF's browsable API, providing easy testing during development.