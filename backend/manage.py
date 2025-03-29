#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os  # OS module to interact with the operating system (e.g., for setting environment variables)
import sys  # sys module to work with command-line arguments

def main():
    """Run administrative tasks."""
    # Setting the default settings module for Django. It tells Django which settings file to use.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    try:
        # Importing the function that handles the command-line administrative tasks in Django
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # If Django is not installed or available, an error is raised with a helpful message.
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Running the command-line utility with the arguments passed to the script
    execute_from_command_line(sys.argv)

# Entry point for the script
if __name__ == '__main__':
    main()


# This script is the entry point for running administrative tasks in a Django project. It sets the default settings module for the Django project (backend.settings), imports the necessary Django management command execution function (execute_from_command_line), and then processes the command-line arguments provided when running the script. If Django is not installed or a virtual environment is not activated, it raises an informative error. This script is typically used to run commands like python manage.py runserver, migrate, or collectstatic.