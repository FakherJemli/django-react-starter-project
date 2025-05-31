from django.test import TestCase
from django.contrib.auth.models import User
from api.models import TextEntry

class TextEntryModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_entry(self):
        entry = TextEntry.objects.create(
            user=self.user,
            content="Test content"
        )
        self.assertEqual(entry.user, self.user)
        self.assertEqual(entry.content, "Test content")