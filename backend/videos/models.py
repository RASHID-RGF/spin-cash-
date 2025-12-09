from django.db import models
from django.conf import settings
from django.utils import timezone


class Video(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField()
    thumbnail_url = models.URLField(blank=True)
    duration = models.IntegerField(default=0)  # in seconds
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    reward_points = models.IntegerField(default=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class VideoWatch(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_watches')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='watches')
    watched_at = models.DateTimeField(default=timezone.now)
    reward_claimed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'video']

    def __str__(self):
        return f"{self.user.email} watched {self.video.title}"
