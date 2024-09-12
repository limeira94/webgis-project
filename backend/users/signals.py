# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

@receiver(post_save, sender=User)
def update_user_profile(sender, instance, **kwargs):
    try:
        profile = Profile.objects.get(user=instance)
        profile.update_profile()
        profile.save()
    except Profile.DoesNotExist:
        # Handle the case where the Profile does not exist
        pass
