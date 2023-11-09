from datetime import timedelta
from pathlib import Path
import os
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='mydefaultsecretkey')

DEBUG = True #config('DEBUG', default=False, cast=bool)

GDAL_LIBRARY_PATH = config('GDAL_LIBRARY_PATH', default='')

GEOS_LIBRARY_PATH = config('GEOS_LIBRARY_PATH', default='')

SETTINGS_MODULE = 'backend.settings'

# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR,'build')

ALLOWED_HOSTS = [
    # '*'
    # '172.31.46.41',
    'ec2-3-144-137-244.us-east-2.compute.amazonaws.com',
    'webgis.site'
    # 'http://ec2-3-144-137-244.us-east-2.compute.amazonaws.com/'
    # 'ec2-3-144-137-244.us-east-2.compute.amazonaws.com'
    ]

if DEBUG:
    ALLOWED_HOSTS.append('127.0.0.1')

CORS_ALLOWED_ORIGINS = [
    'http://ec2-3-144-137-244.us-east-2.compute.amazonaws.com',
    'https://webgis.site'
]

if DEBUG:
    CORS_ALLOWED_ORIGINS.append('http://localhost:3000')
    # CORS_ORIGIN_ALLOW_ALL = True

CSRF_TRUSTED_ORIGINS = [
    # 'https://webgis.felipemp.com'
    'http://ec2-3-144-137-244.us-east-2.compute.amazonaws.com',
    'https://webgis.site'
    ]

SECURE_CROSS_ORIGIN_OPENER_POLICY = None

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'main',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "build")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
         'ENGINE': 'django.contrib.gis.db.backends.postgis',
         'NAME': config("DB_NAME_WG"),#'webgis-project',
         'USER': config("DB_USER_WG"),
         'PASSWORD': config("DB_PASSWORD_WG"),
         'HOST': config("DB_HOST_WG"),
         'PORT': '5432',
    },
}



# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
#USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [
  os.path.join(BASE_DIR, "build/static"),
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ]
}


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


GEOSERVER = {
    "URL":config('GEOSERVER_URL_WG', default='http://localhost:8080/'),
    "WORKSPACE":config('GEOSERVER_WORKSPACE_WG', default='webgis'),
    "USERNAME":config('GEOSERVER_USERNAME_WG', default='admin'),
    "PASSWORD":config('GEOSERVER_PASSWORD_WG', default='geoserver'),
}

# GEOSERVER_URL = config('GEOSERVER_URL_WG', default='http://localhost:8080/')
# GEOSERVER_WORKSPACE = config('GEOSERVER_WORKSPACE_WG', default='')
# GEOSERVER_USERNAME = config('GEOSERVER_USERNAME_WG', default='admin')
# GEOSERVER_PASSWORD = config('GEOSERVER_PASSWORD_WG', default='geoserver')