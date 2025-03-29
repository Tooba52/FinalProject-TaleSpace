from django.apps import AppConfig # Import the base class for app configurations


class ApiConfig(AppConfig): # Define a configuration class for the "api" app
    default_auto_field = 'django.db.models.BigAutoField' # Sets the default field type for primary keys in models
    name = 'api' # Specifies the name of the application


# AppConfig Class:

# Django uses this class to configure application settings when the project starts.

# default_auto_field = 'django.db.models.BigAutoField':

# This sets the default primary key type for models.

# Instead of using AutoField, it uses BigAutoField, which allows larger integer values for primary keys.

# name = 'api':

# This defines the name of the application.

# Django uses this name internally to refer to the app in settings and configurations.
