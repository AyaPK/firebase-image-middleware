# Firebase Image Upload Middleware

A secure and efficient middleware for handling image uploads to Firebase Storage.

## Features

- Secure file upload endpoint with validation
- Supports multiple image formats (JPEG, PNG, GIF, WebP)
- Automatic file naming with UUID
- File size limit (10MB by default)
- Public URL generation
- CORS enabled
- Health check endpoint
- Environment-based configuration

## Prerequisites

- Node.js installed
- Firebase project with Storage enabled
- Service account credentials from Firebase

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/firebase-image-middleware.git
   cd firebase-image-middleware
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Firebase credentials:
   - Get your Firebase Admin SDK private key from the Firebase Console
   - Replace the placeholder values in `.env` with your actual Firebase credentials

5. Start the server:
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Upload Image

- **URL**: `POST /upload`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (the image file to upload)
- **Success Response**:
  ```json
  {
    "success": true,
    "url": "https://storage.googleapis.com/your-bucket/filename.jpg",
    "filename": "unique-filename.jpg",
    "size": 12345,
    "contentType": "image/jpeg"
  }
  ```

### Health Check

- **URL**: `GET /health`
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
  ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Node environment (development/production) |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (with escaped newlines) |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket name |

## Security

- File type validation
- File size limit
- Secure Firebase Admin initialization
- Environment variables for sensitive data
- Error handling and logging

