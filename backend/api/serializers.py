from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import WebsiteUser, Note, Book


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteUser
        fields = ["id", "email", 'username', 'password', 'first_name', 'last_name', 'date_of_birth']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = WebsiteUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            date_of_birth=validated_data["date_of_birth"]
        )
        return user



class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "description", "genres", "language", "mature", "cover_photo", "author", "created_at"]
        extra_kwargs = {"author": {"read_only": True}}