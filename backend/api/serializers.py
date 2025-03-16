from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import WebsiteUser  
from .models import Note


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


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user