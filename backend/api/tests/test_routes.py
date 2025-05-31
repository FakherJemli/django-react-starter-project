# api/tests/test_routes.py
from django.test import TestCase
from django.urls import reverse

class RouteTests(TestCase):
    def test_api_endpoints(self):
        response = self.client.get('/api/entries/')
        self.assertEqual(response.status_code, 401)  # Should require auth

    def test_frontend_routes_return_index_html(self):
        """Test that frontend routes return the index.html template"""
        routes = ['/', '/login', '/logout', '/nonexistent']
        for route in routes:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, '<div id="root">')
            self.assertEqual(
                response.get('Content-Type'),
                'text/html; charset=utf-8'
            )