# Django Settings for SQL Server (SSMS)
# Requires: pip install django-mssql-backend

DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'SariSariDB',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',  # or your SSMS instance name
        'PORT': '',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}

# CORS Settings for React Integration
# Requires: pip install django-cors-headers
INSTALLED_APPS = [
    ...
    'corsheaders',
    'rest_framework',
    'api', # your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://ais-dev-ljs7glgkur7folsmy2wwvz-233145043681.asia-east1.run.app", # Your App URL
]
