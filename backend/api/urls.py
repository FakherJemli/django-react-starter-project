from django.urls import path, include
from .views import TextEntryCreateView, TextEntryListView, GoogleLoginView, openai_proxy

urlpatterns = [
    path('entries/create/', TextEntryCreateView.as_view(), name='create-entry'),
    path('entries/', TextEntryListView.as_view(), name='list-entries'),
    path('openai-proxy/', openai_proxy, name='openai-proxy'),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
]