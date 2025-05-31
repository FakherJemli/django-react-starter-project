# You can use Django's test framework
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from ..models import TextEntry

class TextEntryAccessControlTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user('user1', 'user1@test.com', 'password123')
        self.user2 = User.objects.create_user('user2', 'user2@test.com', 'password123')

        # Create entries for both users
        self.entry1 = TextEntry.objects.create(user=self.user1, content="User 1's entry")
        self.entry2 = TextEntry.objects.create(user=self.user2, content="User 2's entry")

    def test_user_can_only_see_own_entries(self):
        # Login as user1
        self.client.force_authenticate(user=self.user1)

        # Get entries
        response = self.client.get('/api/entries/')
        self.assertEqual(response.status_code, 200)

        # Should only see their own entry
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], "User 1's entry")

    def test_unauthorized_access_denied(self):
        # Try without authentication
        response = self.client.get('/api/entries/')
        self.assertEqual(response.status_code, 401)

    def test_create_entry_assigns_correct_user(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/entries/create/', {'content': 'New entry'})
        self.assertEqual(response.status_code, 201)

        # Verify the entry was assigned to user1
        entry = TextEntry.objects.get(content='New entry')
        self.assertEqual(entry.user, self.user1)