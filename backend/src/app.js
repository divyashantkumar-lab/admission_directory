const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { FRONTEND_ORIGINS } = require('./config/constants');
const studentRoutes = require('./routes/student.routes');

const app = express();

app.disable('x-powered-by');

// Enable gzip compression for all responses
app.use(compression());

/*
 * CSRF mitigation: This API uses Bearer JWT tokens in the Authorization header,
 * not browser-managed session cookies for authentication. Cross-site request
 * forgery against cookie-based sessions does not apply here. For defense-in-depth,
 * all mutating API routes require the X-Requested-With: XMLHttpRequest header
 * (see validator.middleware.js requestedWith).
 */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Cache control headers for API responses
app.use((req, res, next) => {
  // Add security headers for all responses
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');

  // Only cache unfiltered GET requests for 1 hour
  if (req.method === 'GET') {
    // Check if any filter parameters are present
    const hasFilters = req.query.batch || req.query.search || req.query.openSource ||
                       req.query.internship || req.query.club || req.query.studentCouncil;

    if (!hasFilters) {
      // Cache unfiltered requests for 1 hour
      res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      res.set('ETag', 'W/"' + Date.now() + '"');
    } else {
      // Don't cache filtered requests - must revalidate every time
      res.set('Cache-Control', 'public, max-age=0, must-revalidate, no-cache');
      res.set('Pragma', 'no-cache');
    }
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use('/api/students', studentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [],
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [],
  });
});

module.exports = app;
