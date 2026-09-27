from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    CurrentUserView,
    UserManagementViewSet,
    RegisterEmployeeView,
    ChangePasswordView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    SendPhoneOTPView,
    VerifyPhoneOTPView,
)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/logout/', LogoutView.as_view(), name='token_logout'),
    path('me/', CurrentUserView.as_view(), name='user_current'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('phone-otp/send/', SendPhoneOTPView.as_view(), name='phone_otp_send'),
    path('phone-otp/verify/', VerifyPhoneOTPView.as_view(), name='phone_otp_verify'),
    path('users/', UserManagementViewSet.as_view(), name='user_list_create'),
    path('users/register/', RegisterEmployeeView.as_view(), name='employee_register'),
]
