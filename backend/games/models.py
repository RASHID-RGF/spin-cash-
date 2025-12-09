from django.db import models
from django.conf import settings
from django.utils import timezone


class SpinHistory(models.Model):
    SPIN_TYPES = [
        ('free', 'Free'),
        ('paid', 'Paid'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spin_history')
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2)
    spin_type = models.CharField(max_length=10, choices=SPIN_TYPES, default='free')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - {self.spin_type} spin - {self.reward_amount}"


class QuizQuestion(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    question = models.TextField()
    options = models.JSONField()  # Array of options
    correct_answer = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question[:50]


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.IntegerField()  # 0-100
    total_questions = models.IntegerField()
    reward_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - Quiz score: {self.score}%"


class NumberGameAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='number_game_attempts')
    guessed_number = models.IntegerField()
    correct_number = models.IntegerField()
    won = models.BooleanField(default=False)
    reward_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - Number game: {self.guessed_number} (correct: {self.correct_number})"
