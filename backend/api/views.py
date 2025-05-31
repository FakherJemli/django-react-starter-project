from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
import requests
import json
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from .models import TextEntry
from .serializers import TextEntrySerializer
from .openai_prompts import (
    prepare_messages_for_openai,
    update_conversation_history,
    clear_conversation_history
)


class TextEntryCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TextEntrySerializer

    def perform_create(self, serializer):
        # Automatically set the user to the current authenticated user
        serializer.save(user=self.request.user)


class TextEntryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TextEntrySerializer

    def get_queryset(self):
        # Only return the 5 most recent entries belonging to the current user
        return TextEntry.objects.filter(user=self.request.user).order_by('-created_at')[:5]


class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173"


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def openai_proxy(request):
    """
    Proxy endpoint for OpenAI requests that doesn't store API keys.
    The client sends their API key with each request.
    """
    # Validate request data
    required_fields = ['api_key', 'model', 'max_tokens']
    for field in required_fields:
        if field not in request.data:
            return Response(
                {"error": f"Missing required field: {field}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    api_key = request.data.get('api_key')
    reset_conversation = request.data.get('reset_conversation', False)
    user_id = request.user.id
    
    # Get user's recent entries for thought analysis
    if request.data.get('include_entries', False):
        entries = TextEntry.objects.filter(user=request.user).order_by('-created_at')[:5]
        
        if not entries:
            return Response(
                {"prompt": "Start your introspection journey by sharing your thoughts."}, 
                status=status.HTTP_200_OK
            )
        
        # Prepare entries text
        entries_text = "\n\n".join([entry.content for entry in entries])
        
        # Get messages with efficient system prompt handling
        messages = prepare_messages_for_openai(
            user_id=user_id,
            new_entries_text=entries_text,
            reset=reset_conversation
        )
    else:
        # For regular calls (not analysis), use the messages from the request
        # and update conversation if needed
        if reset_conversation:
            clear_conversation_history(user_id)
        
        if 'messages' in request.data:
            messages = request.data.get('messages')
        else:
            return Response(
                {"error": "Messages are required when not including entries"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Prepare the request payload for OpenAI
    payload = {
        "model": request.data.get('model'),
        "messages": messages,
        "max_tokens": request.data.get('max_tokens'),
    }
    
    # Optional parameters
    for param in ['temperature', 'top_p', 'n', 'stream', 'presence_penalty', 'frequency_penalty']:
        if param in request.data:
            payload[param] = request.data.get(param)
    
    # Call OpenAI API
    try:
        openai_api_url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        response = requests.post(
            openai_api_url,
            headers=headers,
            json=payload
        )
        
        # Check if the request was successful
        if response.status_code == 200:
            openai_response = response.json()
            
            # For thought analysis, extract just the prompt
            if request.data.get('include_entries', False):
                prompt = openai_response['choices'][0]['message']['content'].strip()
                
                # Update conversation history with assistant's response
                assistant_message = {
                    "role": "assistant",
                    "content": prompt
                }
                update_conversation_history(user_id, assistant_message)
                
                return Response({"prompt": prompt}, status=status.HTTP_200_OK)
            
            # For other calls, return the full OpenAI response
            return Response(openai_response, status=status.HTTP_200_OK)
        else:
            # Forward OpenAI's error message
            return Response(
                response.json(), 
                status=response.status_code
            )
            
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )