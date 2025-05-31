from django.db import models
from django.contrib.auth.models import User
from encrypted_fields.fields import EncryptedTextField

class TextEntry(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='entries'  # This makes it easy to query user.entries.all()
    )
    content = EncryptedTextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']