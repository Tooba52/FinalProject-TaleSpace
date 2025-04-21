# Code resued from: 
# Author: Tech With Tim
# Video Title: Django & React Web App Tutorial - Authentication, Databases, Deployment & More...
# Video Link -  https://www.youtube.com/watch?v=c-QsfbznSXI


from django.contrib import admin 
from django.urls import path, include 
from django.conf import settings
from django.conf.urls.static import static
from api.views import UserCreateView 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  

# Code reused Lines - 16-23
# URL patterns for the project
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", UserCreateView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/', include('api.urls')),
]

# serve media files (user uploads like book covers
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)