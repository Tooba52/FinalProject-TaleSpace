# FinalProject-TaleSpace

### Env creation and setup:

##### Create env folder:

     python -m venv env

##### Activate env:

    .\env\Scripts\activate

### Backend Setup:

Ensure you have python 3.11.5 higher installed

##### Install backend dependencies:

    .\env\Scripts\activate - if not activated already
    pip install -r requirements.txt

### Frontend Setup:

##### Install frontend dependencies:

    .\env\Scripts\activate - if not activated already
    cd frontend
    npm install

### Database Setup:

##### Create database:

Install postgreSQl and pgadmin 4 - https://www.postgresql.org/download/

Update the password in config.ini to match the password used when setting up pgadmin 4

Create a database in pgadmin 4 with the name "TaleSpace", matching the one in config.ini

##### Filling the database:

Navigate to backend/api/fixtures/inititaldata.json
Change this file to utf-8 and save

    .\env\Scripts\activate - if not activated already
    cd backend
    python manage.py migrate
    python manage.py loaddata api/fixtures/initialdata.json

### Running project:

##### Run backend:

    .\env\Scripts\activate - if not activated already
    cd backend
    python manage.py runserver

##### Run frontend:

    .\env\Scripts\activate - if not avtivated already
    cd frontend
    npm run dev

Click the link provided
