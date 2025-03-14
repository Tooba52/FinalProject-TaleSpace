from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import WebsiteUser  
from .models import Note


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteUser
        fields = ["id", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = WebsiteUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"]
        )
        return user



class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}