if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get("/info/attuality-store", (req, res) => {
  res.render("info/attuality-store");
});
router.get('/info/privacy-cookie-policy', (req, res) => {
  res.render('info/privacy')
})
router.get('/info/online-exclusive-services', (req, res) => {
  res.render('info/online-exclusive')
})
router.get('/info/shipping', (req, res) => {
  res.render('info/shipping')
})
router.get('/info/returns-and-exchanges', (req, res) => {
  res.render('info/returns-and-exchanges')
})
router.get('/info/FAQ', (req, res) => {
  res.render('info/FAQ')
})
router.get('/info/contacts', (req, res) => {
  res.render('info/contacts')
})
router.get('/info/payment', (req, res) => {
  res.render('info/payment')
})

module.exports = router;