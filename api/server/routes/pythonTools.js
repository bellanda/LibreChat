const express = require('express');
const multer = require('multer');
const axios = require('axios');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Proxy route for markdown to HTML conversion
router.post('/convert/md-to-html', upload.single('file'), async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API:', pythonApiUrl);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create FormData for the Python API using axios
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${pythonApiUrl}/convert/md-to-html`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'stream',
    });

    // Set response headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'text/html');
    if (response.headers['content-disposition']) {
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
    }

    // Stream the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Proxy route for markdown to PDF conversion
router.post('/convert/md-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API:', pythonApiUrl);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create FormData for the Python API using axios
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${pythonApiUrl}/convert/md-to-pdf`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'stream',
    });

    // Set response headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
    if (response.headers['content-disposition']) {
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
    }

    // Stream the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;
