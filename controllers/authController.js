// controllers/authController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: null,
    oldInput: { email: '', password: '' },
    validationErrors: []
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: { email, password },
        validationErrors: []
      });
    }

    const doMatch = await User.verifyPassword(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = { id: user.id, name: user.name, email: user.email };
      return req.session.save(err => {
        if (err) {
          console.error(err);
        }
        res.redirect('/library');
      });
    }

    res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: { email, password },
        validationErrors: []
      });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getRegister = (req, res, next) => {
  res.render('auth/register', {
    path: '/register',
    pageTitle: 'Register',
    errorMessage: null,
    oldInput: { name: '', email: '', password: ''},
    validationErrors: []
  });
};

exports.postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/register', {
      path: '/register',
      pageTitle: 'Register',
      errorMessage: errors.array()[0].msg,
      oldInput: { name, email, password },
      validationErrors: errors.array()
    });
  }

  try {
    await User.create(name, email, password);
    res.redirect('/login');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};