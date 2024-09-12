from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        import users.signals  


# class YourAppConfig(AppConfig):
#     name = 'your_app_name'

#     def ready(self):
#         import your_app_name.signals  # Import your signals module
