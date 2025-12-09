from django.db import models
from django.conf import settings
from django.utils import timezone


class Referral(models.Model):
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referrer_links')
    referred = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referred_by_link')
    level = models.IntegerField(default=1)  # 1, 2, or 3
    commission_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.referrer.email} referred {self.referred.email}"


class ReferralSettings(models.Model):
    level = models.IntegerField(unique=True)
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 10.00 for 10%
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Level {self.level}: {self.commission_percentage}%"
