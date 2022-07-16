if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Order = require('../models/order')
const passport = require('passport')
const {userSchema, userChangesSchema} = require('../schemas');
const countries = require('../data/countries')
const nodemailer = require('nodemailer');
const middleware = require('../middleware')
const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const { v4: uuidv4 } = require('uuid');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
});
const store = require('../app')

router.get('/login', (req, res) => {
  if(req.user){
    return res.redirect('/user/dashboard')
  }
  res.render('user/login');
})
router.post('/login', async function(req, res, next) {
  const session = req.session;

  passport.authenticate("local", function(err, user, info) {

    if (err) {
      console.log(err)
      req.flash('error', 'Internal server error')
      res.redirect('/')
    }
    if (!user) {
      req.flash('error', 'Email o password invalida')
      return res.redirect('/login')
    }

    req.logIn(user, function(err) {
      if (err) {
        console.log(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
      }
      
      for(item of Object.keys(session)){
        if(item == 'sid'){
          req.session.sid = req.sessionID
        }else if(item == 'passport'){}
        else{
          req.session[item] = session[item]
        }
      }
      req.flash('success', 'Bentornato/a!')
      return res.redirect('/');
    });

  })(req, res, next)



}, (req, res) => {
  req.flash('success', 'Felice di vederti di nuovo!')
  res.redirect('/')
})

router.get('/register', (req, res) => {
  if(req.user){
    return res.redirect('/user/dashboard')
  }
  res.render('user/register');
})
router.post('/register', async (req, res) => {
  try {
    let number = req.body.number.replaceAll('-', '')
    const { error } = userSchema.validate({
      name: req.body.name,
      surname: req.body.surname,
      number: number,
      email: req.body.email,
      password: req.body.password
    })
    if(error) {
      req.flash('error', error.message);
      return res.redirect('/register');
    }
    if(!countries.includes(req.body.country)){
      req.flash('error', 'Invalid country');
      return res.redirect('/register')
    }
    const phoneNumberExist = await User.find({number: number});
    if(phoneNumberExist.length){
      req.flash('error', 'A user with the given phone number is already registered');
      return res.redirect('/register');
    }
    const user = new User({ 
      name: req.body.name, 
      surname: req.body.surname,
      number: number,
      email: req.body.email,
      country: req.body.country,
      moneyBrought: 0,
      verified: false,
      admin: false,
      createdAt: Date.now() 
    });

    const session = req.session
    const registeredUser = await User.register(user, req.body.password);


    const secret = process.env.JWT_SECRET
    const payload = {id: user._id}
    const token = jwt.sign(payload, secret, { expiresIn: 10 * 60 })
    req.login(registeredUser, async (err) => {
        if (err) return next(err);

        var mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Verification',
            text: `Click on this link to verify your account: ${req.protocol + '://' + req.get('host')}/user/verify/${ token }`
        };
        transporter.sendMail(mailOptions, async function(error, info){
            if (error) {
                console.log(error);
                await User.findByIdAndDelete(user._id)
                req.flash("error", `Internal server error`);
                res.redirect("/");
            }
        });
        for(item of Object.keys(session)){
          if(item == 'sid'){
            req.session.sid = req.sessionID
          }else if(item == 'passport'){}
          else{
            req.session[item] = session[item]
          }
        }
        req.flash("success", `Ti abbiamo inviato una mail di verifica`);
        res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/register");
  }
})

router.get('/logout', middleware.isLoggedIn, (req, res) => {
  const session = req.session
  req.logout(function(err) {
    if (err) {
      req.flash('error', 'Internal server error');
      return res.redirect('/'); 
    }
    for(item of Object.keys(session)){
      if(item == 'sid'){
        req.session.sid = req.sessionID
      }else if(item == 'passport'){}
      else{
        req.session[item] = session[item]
      }
    }
    req.flash('success', 'Alla prossima!')
    res.redirect('/');
  });
})

router.get('/user/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(payload.id, {verified: true});
    req.flash('success', 'User verified successfully');
    return res.redirect('/')
  } catch (error) {
    return res.render('404');
  }
})


router.get('/forgotpassword', (req, res) => {
  res.render('user/forgotpassword')
})
router.post('/forgotpassword', async (req, res) => {
  const secret = process.env.JWT_SECRET
  const user = await User.findOne({email: req.body.email});

  if(!user){
    req.flash('error', "A user with given email doesn't exist")
    return res.redirect('/forgotpassword')
  }
  const payload = {id: user._id}
  const token = jwt.sign(payload, secret, { expiresIn: 11 * 60 })
  var mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Verification',
    text: `Click on this link to change your password: ${req.protocol + '://' + req.get('host')}/forgotpassword/verified/${ token }`
  };
  transporter.sendMail(mailOptions, function(error, info){
    req.flash('success', 'We sent you an email to verify your identity');
    res.redirect('/')
    if (error) {
        req.flash("error", `Internal server error`);
        return res.redirect("/");
    }
  });
})
router.get('/forgotpassword/verified/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.render('user/forgotpassword-verified', { token })
  } catch (error) {
    return res.render('404');
  }
})
router.post('/forgotpassword/verified/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById({_id: payload.id});
    if(req.body.password.length > 40) {
      req.flash('error', 'Invalid password length');
      return res.redirect('/forgotpassword')
    }
    user.setPassword(req.body.password, function(err,user){
      if(err){
          req.flash('error', 'Sorry something went wrong')
          return res.redirect('/')
      } else {
          user.save(function (err) {
            if (err) {
              req.flash("error", "Internal server error");
              return res.redirect("/");
            }
            req.flash("success", "Password changed successfully");
            return res.redirect("/");
          });
        }})
  } catch (error) {
    return res.render('404');
  }
})


router.post('/user/resetpassword', middleware.isLoggedIn, (req, res) => {
  const secret = process.env.JWT_SECRET
  const payload = {id: req.user._id}
  const token = jwt.sign(payload, secret, { expiresIn: 10 * 60 })

  var mailOptions = {
    from: process.env.EMAIL,
    to: req.user.email,
    subject: 'Verification',
    text: `Click on this link to reset your password: ${req.protocol + '://' + req.get('host')}/user/resetpassword/verified/${ token }`
  };
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          req.flash("error", `Internal server error`);
          return res.redirect("/");
      }
  });
  req.flash('success', 'We sent you an email to verify your identity');
  res.redirect('/')
})
router.get('/user/resetpassword/verified/:token', middleware.isLoggedIn, (req, res) => {
  const { token } = req.params;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.render('user/resetpassword-verified', { token })
  } catch (error) {
    return res.render('404');
  }
})
router.post('/user/resetpassword/verified/:token', middleware.isLoggedIn, async (req, res) => {
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById({_id: payload.id});
    if(req.body.password.length > 40) {
      req.flash('error', 'Invalid password length');
      return res.redirect('/forgotpassword')
    }
    user.setPassword(req.body.password, function(err,user){
      if(err){
          req.flash('error', 'Sorry something went wrong')
          return res.redirect('/')
      } else {
          user.save(function(err){
            if(err){
              req.flash('error', 'Internal server error');
              return res.redirect('/')
            }
            req.login(user, function(err){
              req.flash('success', 'Password changed successfully');
              return res.redirect('/')
            })
          })
        }})
  } catch (error) {
    return res.render('404');
  }
})


router.get('/user/dashboard', middleware.isLoggedIn, async (req, res) => {
  let orders = await Order.find({user: req.user._id}).populate('products.product')
  orders = orders.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.render('user/dashboard', {orders})
})

router.get('/cart', async (req, res) => {
  const wishlist = await Product.find({_id : {
    $in: req.session.wishlist
  }})
  for (item of wishlist){
    if(item.draft || item.deleted){
      req.session.wishlist.splice(req.session.wishlist.indexOf(item._id), 1)
      wishlist.splice(wishlist.indexOf(item, 1))
    }
  }
  recentlySeen = []
  try {
    if(req.session.recentlySeen && req.session.recentlySeen.length){
      let temp = req.session.recentlySeen.filter(async element => {
        for(item of req.session.cart){
          if(item.product.toString() == element.toString()){
            return false;
          }
        }
        return true;
      })
      for(element of temp){
        let productToAdd = await Product.findOne({_id: element, draft: false, deleted: false})
        if(productToAdd){
          recentlySeen.unshift(productToAdd)
        }
      }
    }
  } catch (error) {
    req.flash('error','Errore interno del server')
    return res.redirect('/')
  }
  res.render('user/cart', { wishlist, recentlySeen })
})

router.get('/wishlist', async (req, res) => {
  const wishlist = await Product.find({_id : {
    $in: req.session.wishlist
  }})
  for (item of wishlist){
    if(item.draft || item.deleted){
      req.session.wishlist.splice(req.session.wishlist.indexOf(item._id), 1)
      wishlist.splice(wishlist.indexOf(item, 1))
    }
  }
  res.render('user/wishlist', { wishlist })
})

router.patch('/user/savechanges', async (req, res) => {
  try {
    let number = req.body.number.replaceAll('-', '')
    const { error } = userChangesSchema.validate({
      name: req.body.name,
      surname: req.body.surname,
      number: number,
      email: req.body.email
    })
    if(error) {
      req.flash('error', error.message);
      return res.redirect('/user/dashboard');
    }
    if(!countries.includes(req.body.country)){
      req.flash('error', 'Invalid country');
      return res.redirect('/user/dashboard')
    }
    if(number != req.user.number){
      const phoneNumberExist = await User.find({number: number});
      if(phoneNumberExist.length){
        req.flash('error', 'A user with the given phone number is already registered');
        return res.redirect('/user/dashboard');
      }
    }

    await User.findByIdAndUpdate(req.user._id, {
      name: req.body.name,
      surname: req.body.surname,
      number: number,
      email: req.body.email,
      country: req.body.country
    })

    req.flash('success', 'Changes saved successfully')
    return res.redirect('/user/dashboard')

  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/user/dashboard");
  }
})

module.exports = router;