module.exports.isAdmin = async (req, res, next) => {
  if(!req.user || req.user.admin === false){
      return res.render('404')
  }
  next()
}
module.exports.isLoggedIn = (req, res, next) => {
  try{
      id = req.user._id;
      next();
    }catch(e) {
      req.flash('error', 'Prima devi fare il login');
      return res.redirect('/login');
    }
}