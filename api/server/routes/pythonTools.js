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


// REPORTS ROUTES



router.get('/reports/usage-cost', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', models } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (models) params.append('models', models);

    const url = `${pythonApiUrl}/reports/usage-cost${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/top-users-volume', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - Top Users Volume:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', limit } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (limit !== undefined) params.append('limit', limit);

    const url = `${pythonApiUrl}/reports/top-users-volume${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/top-users-cost', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - Top Users Cost:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', limit } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (limit !== undefined) params.append('limit', limit);

    const url = `${pythonApiUrl}/reports/top-users-cost${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/top-models', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - Top Models:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', limit } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (limit !== undefined) params.append('limit', limit);

    const url = `${pythonApiUrl}/reports/top-models${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/available-models', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - Available Models:', pythonApiUrl);

    const url = `${pythonApiUrl}/reports/available-models`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/kpis', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - KPIs:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { start_date, end_date } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);

    const url = `${pythonApiUrl}/reports/kpis${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/user-efficiency', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - User Efficiency:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', limit } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (limit !== undefined) params.append('limit', limit);

    const url = `${pythonApiUrl}/reports/user-efficiency${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// COST CENTER ROUTES

router.get('/reports/top-cost-centers-volume', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - Top Cost Centers Volume:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', limit } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (limit !== undefined) params.append('limit', limit);

    const url = `${pythonApiUrl}/reports/top-cost-centers-volume${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/reports/top-cost-centers-cost', async (req, res) => {
  try {
    const pythonApiUrl = process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785';
    console.log('[DEBUG] Proxying to Python API - Top Cost Centers Cost:', pythonApiUrl);

    // Extrai parâmetros da query string
    const { user, start_date, end_date, search_by = 'username', limit } = req.query;
    
    // Constrói a URL com parâmetros
    const params = new URLSearchParams();
    if (user) params.append('user', user);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    if (search_by) params.append('search_by', search_by);
    if (limit !== undefined) params.append('limit', limit);

    const url = `${pythonApiUrl}/reports/top-cost-centers-cost${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Request URL:', url);

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Reports API error:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Python API error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;

