// app.js
require('dotenv').config(); // Must be at the top
const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const pool = require('./config/database'); // Our promise-based pool

// Import Routers
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');

const app = express();

// Session Store Configuration
const sessionStore = new MySQLStore({
  expiration: 86400000, // 24 hours
  createDatabaseTable: true, // Automatically create the sessions table
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool); // Use our existing database pool

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
  next();
});

// Route Handlers
app.use(authRoutes);
app.use(indexRoutes);
app.use('/api', apiRoutes); // Prefix all API routes with /api

// Centralized Error Handling
app.use((error, req, res, next) => {
  console.error("--- GLOBAL ERROR HANDLER ---");
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || 'An internal server error occurred.';
  res.status(status).render('500', { // You should create a 500.ejs view
    pageTitle: 'Error!',
    path: '/500',
    errorMessage: message
  });
});

// 404 Page
app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404' });
});


const PORT = process.env.PORT || 8000; // Your school server will use port 8000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});