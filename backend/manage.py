import os  
import sys


#Entry point for Django's command-line utility.
def main():
    # Configure Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django not available. Check your installation and virtualenv."
        ) from exc
    
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
