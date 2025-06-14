require('dotenv').config();
const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const extension = path.extname(req.file.originalname);
    const filename = [...Array(10)].map(() => (Math.random().toString(36)[2] || '0')).map(c => Math.random() < 0.5 ? c.toUpperCase() : c).join('');
    
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedAt: new Date().toISOString()
        }
      },
      public: true
    });

    blobStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Error uploading file' });
    });

    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        
        res.status(200).json({
          success: true,
          url: publicUrl,
          filename: [...Array(10)].map(() => (Math.random().toString(36)[2] || '0')).map(c => Math.random() < 0.5 ? c.toUpperCase() : c).join(''),
          size: req.file.size,
          contentType: req.file.mimetype
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({ error: 'Error finalizing upload' });
      }
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload endpoint: POST http://localhost:${PORT}/upload`);
});

module.exports = app;
