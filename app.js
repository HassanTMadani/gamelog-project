// app.js
require('dotenv').config(); //
const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const pool = require('./config/database'); // 

// Import Routers
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');

const app = express();

const BASE_PATH = process.env.BASE_PATH || '';

// Session Store Configuration
const sessionStore = new MySQLStore({
  expiration: 86400000, // 24 hours
  createDatabaseTable: true, // Auto create the sessions table
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool); // Use existing  pool

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware
app.use(express.urlencoded({ extended: false })); // For parsing form data
app.use(express.json()); // For parsing API JSON data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS)

// Session Middleware
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));

// Middleware to make session and user info available in all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  res.locals.BASE_PATH = BASE_PATH; // Make BASE_PATH available in all templates
  next();
});

// Route Handlers
app.use(BASE_PATH, authRoutes);
app.use(BASE_PATH, indexRoutes);
app.use(BASE_PATH + '/api', apiRoutes); // Prefix all API routes with /api

// Centralized Error Handling
app.use((error, req, res, next) => {
  console.error("--- GLOBAL ERROR HANDLER ---");
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || 'An internal server error occurred.';
  res.status(status).render('500', { // Error pages
    pageTitle: 'Error!',
    path: '/500',
    errorMessage: message,
    BASE_PATH: BASE_PATH
  });
});

// 404 Page
app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404', BASE_PATH: BASE_PATH });
});


const PORT = process.env.PORT || 8000; // Default to 8000 if not specified
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});