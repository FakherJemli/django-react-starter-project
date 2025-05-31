# Django React Starter Project

A modern full-stack web application template featuring Django REST API backend and React TypeScript frontend with Google OAuth authentication and client side AI support.

This template demonstrates a full Django app, with django backend and flask frontend with moden design and layout. It provides an out-of-box functionality

* Social Login
* Encrypted Data
* Support for AI with client-side API key storage.

This is a private journaling app that users can use to keep track of their
thoughts; the encrypted data storage should provide a feeling of safety to the
users.  when configured with AI, by using OpenAI API keys, the system will
analyze the most recent 5 thoughts, and share it's thoughts to the user. It will
use the principles of REBT for improvement of self-discipline if necessary.

## Example App

<https://introspect.learntosolveit.com> is an example hosted application of this app.

## Contact

Senthil Kumaran (<orsenthil@gmail.com>)

----

## Architecture

### Overview

This project follows a client-server architecture with a clear separation between the frontend and backend:

* **Backend**: Django REST framework serving API endpoints
* **Frontend**: React with TypeScript, Vite, and TailwindCSS
* **Authentication**: JWT token-based auth with Google OAuth integration
* **Database**: SQLite for development, PostgreSQL for production
* **Security**: Database-level encryption for sensitive user data

### Backend Architecture

The Django backend is structured as follows:

* **API App**: Core functionality for handling data operations
  * `models.py`: Defines the TextEntry model for storing user content
  * `views.py`: Contains API endpoints for creating and listing entries
  * `serializers.py`: Handles data serialization/deserialization
  * `urls.py`: Defines API routing

* **Authentication**:
  * JWT token-based authentication using dj-rest-auth and SimpleJWT
  * Google OAuth integration with django-allauth
  * Token refresh mechanism for maintaining sessions

* **Data Security**:
  * Database-level encryption for sensitive fields using django-fernet-encrypted-fields
  * Persistent encryption keys with environment variable support
  * Transparent encryption/decryption via Django ORM

### Frontend Architecture

The React frontend is organized using a feature-based structure:

* **Authentication Context**: Manages user authentication state across the app
  * JWT token storage in localStorage
  * Automatic token refresh handling
  * Protected routes

* **API Client**: Axios-based client for making API requests
  * Automatic token inclusion in requests
  * Token refresh interceptors
  * Error handling

* **Configuration Management**:
  * Environment variables for API URL and authentication credentials
  * Centralized config file (`src/config.ts`) for maintaining application settings
  * Separation of sensitive credentials from codebase

* **Components**:
  * `Login.tsx`: Handles Google OAuth authentication
  * `TextForm.tsx`: Form for creating and viewing text entries
  * React Query for data fetching and caching

### Communication Flow

1. User authenticates with Google OAuth
2. Backend verifies the Google token and issues JWT tokens
3. Frontend stores tokens and includes them in subsequent API requests
4. When tokens expire, automatic refresh occurs

## Setup and Installation

### Prerequisites

* Python 3.8+
* Node.js 16+
* npm or yarn

### Backend Setup

```shell
# Create and activate virtual environment
python3 -m venv --copies venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Start the development server
python manage.py runserver
```

### Frontend Setup

```shell
# Install dependencies
cd frontend
npm install

# Create .env file for configuration
echo "VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_client_id_here" > .env

# Start the development server
npm run dev
```

## Development

### Running Tests

```shell
cd backend
python manage.py test api.tests
coverage run manage.py test api.tests
```

## Local Iteration Guide

This section provides a step-by-step guide to clone, set up, and extend this project locally to get familiar with the development workflow.

### 1. Clone the Repository

```shell
# Clone the repository
git clone https://github.com/orsenthil/django-react-project.git
cd django-react-project
```

### 2. Environment Setup

#### Python Environment

```shell
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

#### Node.js and TypeScript

```shell
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Return to project root
cd ..
```

#### PostgreSQL Setup (Optional)

```shell
# Install PostgreSQL (Ubuntu)
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS with Homebrew)
brew install postgresql

# Start PostgreSQL service
sudo service postgresql start  # Ubuntu
brew services start postgresql  # macOS

# Single command to create user with all needed permissions
sudo -u postgres psql -c "CREATE USER django_user WITH PASSWORD 'your_password' CREATEDB;"

# Create database with proper ownership
sudo -u postgres psql -c "CREATE DATABASE django_react_db WITH OWNER django_user;"

# Configure role settings
sudo -u postgres psql -c "ALTER ROLE django_user SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE django_user SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE django_user SET timezone TO 'UTC';"

# Grant schema permissions (connect as the postgres user)
sudo -u postgres psql -d django_react_db -c "GRANT ALL ON SCHEMA public TO django_user;"
```

#### Using Postgres.app on macOS (Alternative)

If you're using Postgres.app on macOS, follow these instructions instead:

```shell
# Open Postgres.app first (if not already running)
# No need for brew services or sudo commands

# Start psql command line
psql

# Inside psql, run these commands:

# Create user with all needed permissions
CREATE USER django_user WITH PASSWORD 'your_password' CREATEDB;

# Create database with proper ownership
CREATE DATABASE django_react_db WITH OWNER django_user;

# Configure role settings
ALTER ROLE django_user SET client_encoding TO 'utf8';
ALTER ROLE django_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE django_user SET timezone TO 'UTC';

# Connect to the new database
\c django_react_db

# Grant schema permissions
GRANT ALL ON SCHEMA public TO django_user;

# Exit psql
\q

# The Database URL will be
DATABASE_URL=postgres://django_user:your_password@localhost:5432/django_react_db
```

#### Alternative: All-in-One Database Setup Script

For easier database setup and iterative development, you can copy-paste the following SQL script into a file (e.g., `setup_db.sql`) and run it with `psql`:

```sql
-- setup_db.sql - Run with: psql -f setup_db.sql (Postgres.app) or sudo -u postgres psql -f setup_db.sql

-- First, clean up any existing database and user (for easy iteration)
-- Terminate all connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'django_react_db'
AND pid <> pg_backend_pid();

-- Drop the database if it exists
DROP DATABASE IF EXISTS django_react_db;

-- Drop the user if it exists (may fail if user owns other databases, which is fine)
DROP USER IF EXISTS django_user;

-- Now create everything fresh
-- Create user with all needed permissions
CREATE USER django_user WITH PASSWORD 'your_password' CREATEDB;

-- Create database with proper ownership
CREATE DATABASE django_react_db WITH OWNER django_user;

-- Configure role settings
ALTER ROLE django_user SET client_encoding TO 'utf8';
ALTER ROLE django_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE django_user SET timezone TO 'UTC';

-- Connect to the new database
\connect django_react_db

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO django_user;
```

Running the script:

```shell
# For standard PostgreSQL installation
sudo -u postgres psql -f setup_db.sql

# For Postgres.app on macOS
psql -f setup_db.sql
```

This script performs a complete reset and setup in one operation, making it ideal for development iterations.

#### Update Database Settings

Create a `.env` file in the backend directory:

```shell
# Generate a secure Django secret key and create .env file in one command
# For macOS/Linux:
python -c "import secrets; key=secrets.token_urlsafe(50); print(f'Created .env file with a secure SECRET_KEY\n'); open('.env', 'w').write(f'DATABASE_URL=postgres://django_user:your_password@localhost:5432/django_react_db\nSECRET_KEY={key}\nDEBUG=True\nGOOGLE_CLIENT_ID=your_client_id_here\nGOOGLE_CLIENT_SECRET=your_client_secret_here\nFERNET_KEY=your-deployment-fernet_key\nSALT_KEY=your-deployment-salt_key')"

# For Windows (PowerShell):
# python -c "import secrets; key=secrets.token_urlsafe(50); print(f'Created .env file with a secure SECRET_KEY\n'); open('.env', 'w').write(f'DATABASE_URL=postgres://django_user:your_password@localhost:5432/django_react_db\nSECRET_KEY={key}\nDEBUG=True\nGOOGLE_CLIENT_ID=your_client_id_here\nGOOGLE_CLIENT_SECRET=your_client_secret_here\nFERNET_KEY=your-deployment-fernet_key\nSALT_KEY=your-deployment-salt_key')"
```

This command:

1. Generates a secure random SECRET_KEY
2. Creates the .env file with the DATABASE_URL, SECRET_KEY, and DEBUG settings
3. Be sure to replace 'your_password' with your actual database password

If you prefer to create it manually, add the following content to your `.env` file:

```
DATABASE_URL=postgres://django_user:your_password@localhost:5432/django_react_db
SECRET_KEY=django-insecure-key-replace-me-with-generated-key
DEBUG=True
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 3. Authentication Configuration

#### Set Up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID:
   * Application type: Web application
   * Name: Django React Project
   * Authorized JavaScript origins: `http://localhost:5173`
   * Authorized redirect URIs: `http://localhost:5173`
5. Note your Client ID and Client Secret

#### Update Backend Settings

Add your Google OAuth credentials to the backend `.env` file:

```shell
# backend/.env
DATABASE_URL=postgres://django_user:your_password@localhost:5432/django_react_db
SECRET_KEY=django-insecure-key-replace-me-with-generated-key
DEBUG=True
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

The Django settings will use these environment variables for Google OAuth credentials or fall back to the default ones if not provided.

Edit `backend/config/settings.py` to configure other OAuth settings if needed:

```python
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}
```

#### Update Frontend Settings

Create a `.env` file in the `frontend` directory with your Google OAuth client ID:

```shell
# frontend/.env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

The application uses a centralized config file (`frontend/src/config.ts`) that reads from these environment variables:

```typescript
// Configuration settings for the application
export const config = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
};
```

The config is then used in `App.tsx`:

```typescript
<GoogleOAuthProvider clientId={config.googleClientId}>
    {/* ... */}
</GoogleOAuthProvider>
```

### 4. Run and Test Locally

#### Start the Backend

```shell
cd backend
python manage.py migrate  # Apply migrations
python manage.py runserver
```

The backend will be running at `http://localhost:8000`.

#### Start the Frontend

In a new terminal:

```shell
cd frontend
npm run dev
```

The frontend will be running at `http://localhost:5173`.

#### Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Login with Google" and complete the authentication
3. Create a text entry
4. Verify that your entry appears in the list

### 5. Extend the Project: Add a "Favorite" Feature

Let's add a simple feature to mark text entries as favorites. This will demonstrate how to extend both the backend and frontend.

#### Backend Changes

1. **Update the Model**:

   Edit `backend/api/models.py`:

   ```python
   class TextEntry(models.Model):
       user = models.ForeignKey(
           User,
           on_delete=models.CASCADE,
           related_name='entries'
       )
       content = models.TextField()
       created_at = models.DateTimeField(auto_now_add=True)
       is_favorite = models.BooleanField(default=False)  # Add this line

       class Meta:
           ordering = ['-created_at']
   ```

2. **Update the Serializer**:

   Edit `backend/api/serializers.py`:

   ```python
   class TextEntrySerializer(serializers.ModelSerializer):
       class Meta:
           model = TextEntry
           fields = ['id', 'content', 'created_at', 'is_favorite']
           read_only_fields = ['id', 'created_at']
   ```

3. **Add a Toggle Favorite Endpoint**:

   Edit `backend/api/views.py`:

   ```python
   from rest_framework.decorators import api_view, permission_classes
   from rest_framework.response import Response
   from rest_framework import status

   # Add this view
   @api_view(['POST'])
   @permission_classes([IsAuthenticated])
   def toggle_favorite(request, pk):
       try:
           entry = TextEntry.objects.get(pk=pk, user=request.user)
           entry.is_favorite = not entry.is_favorite
           entry.save()
           return Response({'is_favorite': entry.is_favorite})
       except TextEntry.DoesNotExist:
           return Response(status=status.HTTP_404_NOT_FOUND)
   ```

4. **Update URLs**:

   Edit `backend/api/urls.py`:

   ```python
   from django.urls import path
   from .views import TextEntryCreateView, TextEntryListView, GoogleLoginView, toggle_favorite

   urlpatterns = [
       path('entries/create/', TextEntryCreateView.as_view(), name='create-entry'),
       path('entries/', TextEntryListView.as_view(), name='list-entries'),
       path('entries/<int:pk>/toggle-favorite/', toggle_favorite, name='toggle-favorite'),
       path('auth/', include('dj_rest_auth.urls')),
       path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
   ]
   ```

5. **Apply Migrations**:

   ```shell
   python manage.py makemigrations
   python manage.py migrate
   ```

#### Frontend Changes

1. **Update Types**:

   Edit `frontend/src/types/api.ts`:

   ```typescript
   export interface TextEntry {
       id: number;
       content: string;
       created_at: string;
       is_favorite: boolean;
   }
   ```

2. **Add Toggle Favorite Function**:

   Edit `frontend/src/components/TextForm.tsx`:

   ```typescript
   // Add this mutation
   const toggleFavoriteMutation = useMutation({
       mutationFn: (entryId: number) => 
           client.post(`/entries/${entryId}/toggle-favorite/`),
       onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['entries'] });
       }
   });

   const handleToggleFavorite = (entryId: number) => {
       toggleFavoriteMutation.mutate(entryId);
   };
   ```

3. **Update UI to Show Favorite Status**:

   In the same file, update the entry rendering:

   ```tsx
   {entries?.map(entry => (
       <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
           <div className="flex justify-between items-start">
               <p className="text-gray-800 mb-2">{entry.content}</p>
               <button 
                   onClick={() => handleToggleFavorite(entry.id)}
                   className="text-yellow-500 hover:text-yellow-600"
               >
                   {entry.is_favorite ? '★' : '☆'}
               </button>
           </div>
           <p className="text-sm text-gray-500">
               {new Date(entry.created_at).toLocaleString()}
           </p>
       </div>
   ))}
   ```

#### Test Your Changes

1. Restart both the backend and frontend servers
2. Create some text entries
3. Click the star icon to toggle favorite status
4. Verify that the star changes between filled and unfilled
5. Refresh the page and verify that the favorite status persists

This simple extension demonstrates how to:

* Add a new field to a model
* Create a new API endpoint
* Use React Query for mutations
* Update the UI to reflect backend changes

It covers the full stack from database to user interface, giving you a good foundation for developing more complex features.

## Deployment

This project is configured for deployment on Render.com using the included `render.yaml` configuration:

* Backend: Django service with gunicorn
* Frontend: Static site hosting
* Database: PostgreSQL

To deploy:

1. Fork or clone this repository
2. Connect to Render.com
3. Create a new Blueprint using the repository
4. Configure environment variables

## Environment Variables

### Backend

* `SECRET_KEY`: Django secret key
* `DEBUG`: Set to False in production
* `DATABASE_URL`: Database connection string
* `GOOGLE_CLIENT_ID`: Google OAuth Client ID
* `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

### Frontend

* `VITE_API_URL`: Backend API URL
* `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID

### Required Environment Variables

The following environment variables should be set in production:

* `SECRET_KEY`: Django's secret key
* `GOOGLE_CLIENT_ID`: OAuth client ID for Google authentication
* `GOOGLE_CLIENT_SECRET`: OAuth client secret for Google authentication
* `FERNET_KEY`: Encryption key for database fields (critical for data recovery)
* `SALT_KEY`: Salt used in encryption (optional, defaults to a hardcoded value)

### Critical Security Notes

#### Database Encryption

This application uses Fernet symmetric encryption to protect sensitive data in the database:

1. **IMPORTANT**: The `FERNET_KEY` environment variable must be backed up securely. If this key is lost, encrypted data becomes permanently unrecoverable.

2. For production deployments:

   ```shell
   # Generate a secure Fernet key with this one-line Python command
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   
   # This will output a key like: 9Vz2JxI5YYbuDFiVzwxS-KYcm4fTCYrEaQ6LIKLxVrE=
   # Use this key as your FERNET_KEY environment variable
   ```

3. Set this key in your environment:
   * For local development: Add to your `.env` file as `FERNET_KEY=your-key-here`
   * For Render.com: Add to environment variables in the dashboard
   * For other platforms: Use their environment variable configuration

4. If multiple application instances are deployed, ensure they all use the same `FERNET_KEY`.

5. Key rotation is not implemented automatically - changing keys requires a migration plan.

#### Render.com Deployment

When deploying to Render:

1. Add `FERNET_KEY` to environment variables in the Render dashboard
2. Add `SALT_KEY` (optional) or use the default
3. Ensure all web service instances use the same key values

Remember that if the encryption key is lost or changed without a migration plan, all encrypted data will be permanently unrecoverable.
