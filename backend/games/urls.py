from django.urls import path
from . import views

urlpatterns = [
    path('spin', views.spin_wheel, name='spin_wheel'),
    path('spin/history/<int:user_id>', views.get_spin_history, name='spin_history'),
    path('quiz/questions', views.get_quiz_questions, name='quiz_questions'),
    path('quiz/submit', views.submit_quiz, name='submit_quiz'),
    path('number-game/play', views.play_number_game, name='play_number_game'),
    path('number-game/history/<int:user_id>', views.get_number_game_history, name='number_game_history'),
]