// middleware/isAuth.js
module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    // If user is not logged in, redirect them to the login page
    return res.redirect(process.env.BASE_PATH + '/login');
  }
  // If user is logged in, proceed to the next middleware/controller
  next();
};