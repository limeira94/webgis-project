import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User


@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='test123')


@pytest.mark.django_db
def test_user_registrarion_with_valid_data(client):
    url = reverse('user-register')
    data = {
        'username': 'testuser',
        'password': 'test123',
        'email': 'test@example.com'
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 201
    assert User.objects.count() == 1
    assert User.objects.get().username == 'testuser'


@pytest.mark.django_db
def test_user_registration_with_invalid_data(client):
    url = reverse('user-register')
    data = {
        'username': 'testuser',
        'email': 'test@example.com',
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 400
    assert User.objects.count() == 0
    

@pytest.mark.django_db
def test_user_registration_with_duplicate_username(client):
    User.objects.create_user(username='testuser', password='test123', email='test@example.com')
    url = reverse('user-register')
    data = {
        'username': 'testuser',
        'password': 'test123',
        'email': 'test2@example.com'
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 400
    assert User.objects.count() == 1


@pytest.mark.django_db
def test_login_with_valid_data(client, user):
    url = reverse('user-login')
    data = {
        'username': 'testuser',
        'password': 'test123',
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 200
    assert 'access_token' in response.data


@pytest.mark.django_db
def test_login_with_invalid_password(client, user):
    url = reverse('user-login')
    data = {
        'username': 'testuser',
        'password': 'test1234',
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 401
    assert 'non_field_errors' not in response.data


@pytest.mark.django_db
def test_login_with_unregistered_username(client):
    url = reverse('user-login')
    data = {
        'username': 'testuser2',
        'password': 'test1234',
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 401
    assert 'non_field_errors' not in response.data










