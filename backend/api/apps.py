from django.apps import AppConfig # Import the base class for app configurations


class ApiConfig(AppConfig): # Define a configuration class for the "api" app
    default_auto_field = 'django.db.models.BigAutoField' # Sets the default field type for primary keys in models
    name = 'api' # Specifies the name of the application

