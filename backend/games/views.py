from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from .models import SpinHistory, QuizQuestion, QuizAttempt, NumberGameAttempt
from accounts.models import Wallet, Transaction
import random


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def spin_wheel(request):
    user = request.user
    spin_type = request.data.get('spinType', 'free')

    # Check daily spin limit for free spins
    if spin_type == 'free':
        today = timezone.now().date()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        today_end = timezone.make_aware(datetime.combine(today, datetime.max.time()))

        today_spins = SpinHistory.objects.filter(
            user=user,
            created_at__gte=today_start,
            created_at__lte=today_end
        ).count()

        if today_spins >= 5:
            return Response({'error': 'Daily spin limit reached'}, status=status.HTTP_400_BAD_REQUEST)

    # Check spin points for paid spins
    elif spin_type == 'paid':
        try:
            wallet = user.wallet
            if wallet.spin_points < 10:
                return Response({'error': 'Insufficient spin points'}, status=status.HTTP_400_BAD_REQUEST)
            wallet.spin_points -= 10
            wallet.save()
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate random reward (1-100 points)
    reward = random.randint(1, 100)

    # Update wallet
    try:
        wallet = user.wallet
        wallet.balance += reward
        wallet.total_earnings += reward
        wallet.save()
    except Wallet.DoesNotExist:
        return Response({'error': 'Wallet not found'}, status=status.HTTP_400_BAD_REQUEST)

    # Record transaction
    Transaction.objects.create(
        user=user,
        type='spin_reward',
        amount=reward,
        description=f'Spin reward ({spin_type})'
    )

    # Record spin history
    SpinHistory.objects.create(
        user=user,
        reward_amount=reward,
        spin_type=spin_type
    )

    return Response({
        'success': True,
        'reward': reward,
        'message': f'You won {reward} points!'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_spin_history(request, user_id):
    if request.user.id != int(user_id):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    spins = SpinHistory.objects.filter(user_id=user_id).order_by('-created_at')[:50]
    data = [{
        'id': spin.id,
        'reward_amount': spin.reward_amount,
        'spin_type': spin.spin_type,
        'created_at': spin.created_at
    } for spin in spins]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_questions(request):
    questions = QuizQuestion.objects.filter(is_active=True).order_by('-created_at')[:10]
    data = [{
        'id': q.id,
        'question': q.question,
        'options': q.options,
        'category': q.category,
        'difficulty': q.difficulty
    } for q in questions]

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request):
    user = request.user
    answers = request.data.get('answers', [])

    if not answers:
        return Response({'error': 'Answers are required'}, status=status.HTTP_400_BAD_REQUEST)

    correct_answers = 0
    total_questions = len(answers)

    for answer in answers:
        try:
            question = QuizQuestion.objects.get(id=answer['questionId'])
            if question.correct_answer == answer['answer']:
                correct_answers += 1
        except QuizQuestion.DoesNotExist:
            continue

    score = round((correct_answers / total_questions) * 100) if total_questions > 0 else 0
    reward = correct_answers * 5  # 5 points per correct answer

    # Update wallet
    try:
        wallet = user.wallet
        wallet.balance += reward
        wallet.total_earnings += reward
        wallet.save()
    except Wallet.DoesNotExist:
        return Response({'error': 'Wallet not found'}, status=status.HTTP_400_BAD_REQUEST)

    # Record transaction
    Transaction.objects.create(
        user=user,
        type='quiz_reward',
        amount=reward,
        description=f'Quiz reward: {correct_answers}/{total_questions} correct'
    )

    # Record quiz attempt
    QuizAttempt.objects.create(
        user=user,
        score=score,
        total_questions=total_questions,
        reward_earned=reward
    )

    return Response({
        'success': True,
        'score': score,
        'correctAnswers': correct_answers,
        'totalQuestions': total_questions,
        'reward': reward,
        'message': f'You scored {score}% and earned {reward} points!'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def play_number_game(request):
    user = request.user
    guessed_number = request.data.get('guessedNumber')

    if guessed_number is None or not isinstance(guessed_number, int) or not (1 <= guessed_number <= 100):
        return Response({'error': 'Guessed number must be between 1 and 100'}, status=status.HTTP_400_BAD_REQUEST)

    correct_number = random.randint(1, 100)
    won = guessed_number == correct_number
    reward = 50 if won else 0

    # Update wallet if won
    if won:
        try:
            wallet = user.wallet
            wallet.balance += reward
            wallet.total_earnings += reward
            wallet.save()

            # Record transaction
            Transaction.objects.create(
                user=user,
                type='game_reward',
                amount=reward,
                description='Number game win'
            )
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=status.HTTP_400_BAD_REQUEST)

    # Record attempt
    NumberGameAttempt.objects.create(
        user=user,
        guessed_number=guessed_number,
        correct_number=correct_number,
        won=won,
        reward_earned=reward
    )

    message = f'Congratulations! You won {reward} points!' if won else f'Sorry, the correct number was {correct_number}.'

    return Response({
        'success': True,
        'correctNumber': correct_number,
        'won': won,
        'reward': reward,
        'message': message
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_number_game_history(request, user_id):
    if request.user.id != int(user_id):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    attempts = NumberGameAttempt.objects.filter(user_id=user_id).order_by('-created_at')[:50]
    data = [{
        'id': attempt.id,
        'guessed_number': attempt.guessed_number,
        'correct_number': attempt.correct_number,
        'won': attempt.won,
        'reward_earned': attempt.reward_earned,
        'created_at': attempt.created_at
    } for attempt in attempts]

    return Response(data)
