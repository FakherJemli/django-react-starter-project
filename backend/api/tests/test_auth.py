from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.urls import reverse

from api.models import TextEntry


class AuthenticationTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_unauthorized_access(self):
        # Try accessing entries without authentication
        url = reverse('list-entries')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_access_other_user_entries(self):
        # Create two users and authenticate as one
        other_user = User.objects.create_user(
            username='otheruser',
            password='pass123'
        )

        # Create entries for both users
        other_user_entry = TextEntry.objects.create(
            user=other_user,
            content="Other user's entry"
        )

        user_entry = TextEntry.objects.create(
            user=self.user,
            content="Test user's entry"
        )

        # Verify both entries exist in database
        self.assertEqual(TextEntry.objects.count(), 2)

        # Login as self.user
        self.client.force_authenticate(user=self.user)

        # Try to access entries
        url = reverse('list-entries')
        response = self.client.get(url)

        # Should get 200 with only the authenticated user's entries
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], "Test user's entry")
        self.assertNotIn("Other user's entry", [entry['content'] for entry in response.data])

        # Verify other_user's entry still exists in database
        self.assertTrue(TextEntry.objects.filter(id=other_user_entry.id).exists())