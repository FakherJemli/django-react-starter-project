from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.urls import reverse
from api.models import TextEntry

class TextEntryViewsTest(APITestCase):
    def setUp(self):
        # Create two users
        self.user1 = User.objects.create_user(
            username='user1',
            password='pass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            password='pass123'
        )

        # Create entries for each user
        self.entry1 = TextEntry.objects.create(
            user=self.user1,
            content="User 1's entry"
        )
        self.entry2 = TextEntry.objects.create(
            user=self.user2,
            content="User 2's entry"
        )

    def test_list_entries_authenticated(self):
        # Login as user1
        self.client.force_authenticate(user=self.user1)

        # Get entries
        url = reverse('list-entries')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], "User 1's entry")

    def test_create_entry_authenticated(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('create-entry')
        data = {'content': 'New test entry'}

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)

        # Verify entry was created with correct user
        self.assertTrue(TextEntry.objects.filter(
            user=self.user1,
            content='New test entry'
        ).exists())