from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from .models import User, Wallet
import uuid


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    full_name = request.data.get('full_name', '')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate referral code
    referral_code = str(uuid.uuid4())[:10]

    user = User.objects.create(
        email=email,
        password=make_password(password),
        full_name=full_name,
        referral_code=referral_code,
        username=email  # Use email as username since we set USERNAME_FIELD
    )

    # Create wallet
    Wallet.objects.create(user=user)

    return Response({
        'user': {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'referral_code': user.referral_code
        },
        'message': 'User registered successfully'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=email, password=password)

    if user is not None:
        login(request, user)
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'referral_code': user.referral_code
            },
            'message': 'Login successful'
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    try:
        wallet = user.wallet
        wallet_data = {
            'balance': wallet.balance,
            'spin_points': wallet.spin_points,
            'total_earnings': wallet.total_earnings
        }
    except Wallet.DoesNotExist:
        wallet_data = None

    return Response({
        'user': {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'avatar_url': user.avatar_url,
            'phone': user.phone,
            'referral_code': user.referral_code,
            'is_admin': user.is_admin
        },
        'wallet': wallet_data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'OK',
        'message': 'Django backend is running'
    })
