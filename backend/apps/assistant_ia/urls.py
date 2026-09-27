from django.urls import path
from .views import ChatAPIView, ConversationListView

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='assistant-chat'),
    path('conversations/', ConversationListView.as_view(), name='assistant-conversations'),
]
