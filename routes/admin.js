if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Product = require('../models/product')
const Order = require('../models/order')
const middleware = require('../middleware')

const { storageProduct } = require('../cloudinary/products');
const multer = require('multer')
const upload = multer({ storage: storageProduct });
const {cloudinary} = require('../cloudinary/products')

const { v4: uuidv4 } = require('uuid');
const store = require('../app')

setInterval(() => {
  store.all(async (error, sessions) => {
    sessions.forEach(session => {
      if(session.landingPage.split('.').length > 1 || session.landingPage == '/webhook'){
        store.destroy(session.sid)
      }
    })
  })
}, 1000 * 60 * 60 * 24 * 7)

router.get('/user/admin/analysis', middleware.isAdmin, (req, res) => {
  let { start, end } = req.query;
  if(new Date(start) == 'Invalid Date' || new Date(end) == 'Invalid Date'){
    start = false;
    end = false;
  }

  let startDate;
  let endDate;
  if(!start && !end){
    startDate = new Date()
    startDate = new Date(startDate.setDate(startDate.getDate() - 30))
    endDate = new Date()

    start = startDate.toISOString().split('T')[0]
    end = endDate.toISOString().split('T')[0]

    end = end.split('-')
    end = end[1] + '/' + end[2] + '/' + end[0]

    start = start.split('-')
    start = start[1] + '/' + start[2] + '/' + start[0]
  
  }else{  
    startDate = new Date(start)
    startDate = new Date(startDate.setDate(startDate.getDate() + 1))
    endDate = new Date(end)
    endDate = new Date(endDate.setDate(endDate.getDate() + 1))
    if(endDate.getTime() > new Date().getTime()){
      endDate = new Date()
      end = endDate.toISOString().split('T')[0]

      end = end.split('-')
      end = end[1] + '/' + end[2] + '/' + end[0]
    }
  }

  store.all(async (error, sessions) => {
    sessions.forEach(session => {
      if(session.landingPage.split('.').length > 1 || session.landingPage == '/webhook'){
        store.destroy(session.sid)
      }
    })

    let users = await User.find({})
    users = users.filter(user => {
      return (startDate <= new Date(user.createdAt.toISOString().split('T')[0]) && new Date(user.createdAt.toISOString().split('T')[0]) <= endDate)
    })


    let allOrders = await Order.find({}).populate('products.product')
    allOrders = allOrders.sort((a,b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    })
    const orders = allOrders.filter(order => {
      return (startDate <= new Date(order.createdAt.toISOString().split('T')[0]) && new Date(order.createdAt.toISOString().split('T')[0]) <= endDate)
    })

    let activeSessions = sessions.filter(session => {
      try {
      return (startDate <= new Date(session.lastSeen.split('T')[0]) && new Date(session.lastSeen.split('T')[0]) <= endDate);
      } catch (error) {
      console.log(error)
      return false;
      }
    });
    sessions = sessions.filter(session => {
      return (startDate <= new Date(session.createdAt.split('T')[0]) && new Date(session.createdAt.split('T')[0]) <= endDate);
    });

    res.render('admin/analysis', { sessions, start, end, users, activeSessions, orders, allOrders })
  })
})
router.get('/user/admin/users', middleware.isAdmin, async (req, res) => {
  const users = await User.find({})
  res.render('admin/users', { users })
})

router.delete('/user/admin/users/delete/:id', middleware.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
    if(user.admin){
      req.flash('error', 'Non puoi eleminare un admin')
      return res.redirect('/user/admin/users')
    }
    await User.findByIdAndDelete(id);
    res.redirect('/user/admin/users')
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})
router.get('/user/admin/users/info/:id', middleware.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
    const orders = await Order.find({user: user._id}).populate('products.product')
    res.render('admin/info-user', { user, orders })
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})
router.get('/user/admin/users/modify/:id', middleware.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render('admin/modify-user', { user })
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})
router.patch('/user/admin/users/modify/:id', middleware.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // modificare utente
    const user = await User.findByIdAndUpdate(id,
      {
        name: req.body.anme,
        surname: req.body.surname,
        country: req.body.country,
        email: req.body.email,
        number: req.body.number
    });
    req.flash('success', ' Utente modificato con successo')
    res.redirect('/user/admin/users')
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})

router.get('/user/admin/products', middleware.isAdmin, async (req, res) => {
  const products = await Product.find({ deleted: false });
  res.render('admin/products', { products })
})
router.get('/user/admin/products/add', middleware.isAdmin, (req, res) => {
  const designers = process.env.DESIGNERS.split(' ')
  const categories = process.env.CLOTHING.split(' ').concat(...process.env.ACCESSORIES.split(' '))
  res.render('admin/add-product', { designers, categories })
})
router.post('/user/admin/products/add', middleware.isAdmin, upload.array('images'), async (req, res) => {
  async function checkInput() {
    if(req.body.category == 'none'){
      for(file of req.files){
        await cloudinary.uploader.destroy(file.filename)
      }
      req.flash('error', 'Categoria invalida')
      return res.redirect('/user/admin/products/add')
    }
    else if(req.body.designer == 'none'){
      for(file of req.files){
        await cloudinary.uploader.destroy(file.filename)
      }
      req.flash('error', 'Designer invalido')
      return res.redirect('/user/admin/products/add')
    }

    let images = [];
    let files = [...req.files]
    files.shift()
    for(file of files){
      images.push({
        filename: file.filename,
        path: file.path
      })
    }
    let product;
    try {
      product = new Product({
        price: req.body.price,
        discountedPrice: req.body.discountedPrice,
        images: images,
        modelName: req.body.modelName,
        designer: req.body.designer,
        category: req.body.category,
        sizeGuide: req.files[0].filename,
        description: req.body.description,
        createdAt: new Date(),
        draft: false,
        deleted: false,
        urlSlug: req.body.modelName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + uuidv4(),
        sizes: JSON.parse(req.body.sizes),
      })
      await product.save()

      let passed = false;
      for(size of product.sizes){
        if(size.remaining > 0){
          passed = true
        }
      }
      if(!passed){
        await Product.findByIdAndUpdate(product._id, { draft: true })
      }

    } catch (error) {
      req.flash('error', 'Errore interno')
      return res.redirect('/user/admin/products')
    }

    

    req.flash('success', 'Prodotto creato con successo')
    return res.redirect('/user/admin/products')
  }
  return checkInput()
})
router.get('/user/admin/products/modify/:id', middleware.isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    let uuids = [];
    for(size of product.sizes){
      uuids.push(uuidv4())
    }
    const designers = process.env.DESIGNERS.split(' ')
    const categories = process.env.CLOTHING.split(' ').concat(...process.env.ACCESSORIES.split(' '))
    res.render('admin/modify-product', { designers, categories, product, uuids })
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})

router.patch('/user/admin/products/modify/:id', middleware.isAdmin, async (req, res) => {
  async function checkInput() {
    if(req.body.category == 'none'){
      req.flash('error', 'Categoria invalida')
      return res.redirect('/user/admin/products/modify/' + req.params.id)
    }
    else if(req.body.designer == 'none'){
      req.flash('error', 'Designer invalido')
      return res.redirect('/user/admin/products/modify/' + req.params.id)
    }

    try{
      await Product.findByIdAndUpdate(req.params.id, {
        price: req.body.price,
        discountedPrice: req.body.discountedPrice,
        modelName: req.body.modelName,
        designer: req.body.designer,
        category: req.body.category,
        sizeGuide: req.body.sizeGuide,
        description: req.body.description,
        sizes: JSON.parse(req.body.sizes),
      })
    }catch(e){
      req.flash('error', 'Errore interno')
      return res.redirect('/user/admin/products')
    }
  
    req.flash('success', 'Prodotto modificato con successo')
    res.redirect('/user/admin/products')
  }
  return checkInput()
})
router.patch('/user/admin/products/modify/images/:id', middleware.isAdmin, upload.array('images'), async (req, res) => {
  async function checkInput() {

    try {
      const product = await Product.findById(req.params.id)
      for(image of product.images){
        await cloudinary.uploader.destroy(image.filename)
      }
  
      let images = [];
      for(file of req.files){
        images.push({
          filename: file.filename,
          path: file.path
        })
      }
      await Product.findByIdAndUpdate(req.params.id, {
        images: images,
      })
  
  
      req.flash('success', 'Prodotto modificato con successo')
      res.redirect("/user/admin/products/modify/" + req.params.id);
    } catch (error) {
      req.flash('error', 'Invalid id')
      return res.redirect('/user/admin/analysis')
    }
  }
  return checkInput()
})
router.patch('/user/admin/products/modifysize/images/:id', middleware.isAdmin, upload.array('size'), async (req, res) => {
  async function checkInput() {

    try {
      const product = await Product.findById(req.params.id)
      await cloudinary.uploader.destroy(product.sizeGuide)
      
      await Product.findByIdAndUpdate(req.params.id, {
        sizeGuide: req.files[0].filename,
      })
  
      req.flash('success', 'Prodotto modificato con successo')
      res.redirect('/user/admin/products/modify/' + req.params.id)
    } catch (error) {
      req.flash('error', 'Invalid id')
      return res.redirect('/user/admin/analysis')
    }
  }
  return checkInput()
})

router.delete('/user/admin/products/delete/:id', middleware.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, { deleted: true });
    res.redirect("/user/admin/products/modify/" + req.params.id);
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})

router.get('/user/admin/orders', middleware.isAdmin, async (req, res) => {
  let orders = await Order.find({}).populate('products.product')
  orders = orders.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  })


  res.render('admin/orders', { orders })
})
router.get('/user/admin/orders/info/:id', middleware.isAdmin, async (req, res) => {
  try {
    let order = await Order.findById(req.params.id).populate('products.product')
  
    res.render('admin/info-order', { order })
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})
router.patch('/user/admin/orders/changestatus/:id', middleware.isAdmin, async (req, res) => {

 try {
   let order = await Order.findById(req.params.id).populate('products.product')
 
   if(order.completed){
     await Order.findByIdAndUpdate(order._id, {completed: false})
   }else{
     await Order.findByIdAndUpdate(order._id, {completed: true})
   }
 
   res.redirect('/user/admin/orders/info/' + order._id)
 } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
 }
})

router.patch('/user/admin/products/modifydraft/:id', middleware.isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    if(product.draft){
      await Product.findByIdAndUpdate(id, { draft: false })
    }else{
      await Product.findByIdAndUpdate(id, { draft: true })
    }
    return res.redirect('/user/admin/products/modify/' + id)
  } catch (error) {
    req.flash('error', 'Invalid id')
    return res.redirect('/user/admin/analysis')
  }
})

module.exports = router;