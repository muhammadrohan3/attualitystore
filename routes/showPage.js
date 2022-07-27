if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const router = express.Router();
const Product = require('../models/product')
const { v4: uuidv4 } = require('uuid');

router.get('/product/:urlSlug', async (req, res) => {
  const { urlSlug } = req.params;
  let { sizeQuery, from } = req.query;
  try {
    const product = await Product.findOne({urlSlug: urlSlug, draft: false, deleted: false})
  
    if(!req.session.recentlySeen){
      req.session.recentlySeen = []
    }
    if(req.session.recentlySeen.includes(product._id.toString())){
      req.session.recentlySeen.splice(req.session.recentlySeen.indexOf(product._id.toString()), 1)
      req.session.recentlySeen.unshift(product._id.toString())
    }else{
      req.session.recentlySeen.unshift(product._id.toString())
    }
    req.session.recentlySeen.splice(12)
    
    let completeYourLook = [];
    if(product.category != 'wallets-and-small-leather-goods'){
      completeYourLook = await Product.find({category: 'wallets-and-small-leather-goods', draft: false, deleted: false})
      completeYourLook = completeYourLook.sort((a, b) => {
        return 0.5 - Math.random()
      })
      completeYourLook.slice(12)
    }
  
    recentlySeen = []
    if(req.session.recentlySeen && req.session.recentlySeen.length){
      let temp = req.session.recentlySeen.filter(element => {
        return element != product._id.toString() && element
      })
      for(element of temp){
        let productToAdd = await Product.findOne({_id: element, draft: false, deleted: false})
        if(productToAdd){
          recentlySeen.unshift(productToAdd)
        }
      }
    }
  
    let similars = await Product.find({category : product.category, draft: false, deleted: false});
  
    similars = similars.filter(similar => {
      for(size of similar.sizes){
        if(size.remaining != 0){
          return true
        }
      }
      return false;
    })
  
    similars.forEach((similar, index) => {
      for(element of recentlySeen){
        if(element){
          if(element._id.toString() == similar._id.toString()){
            similars.splice(index, 1)
          }
        }
      }
    })
  
    similars = similars.sort((a, b) => {
      return 0.5 - Math.random()
    })
  
    similars = similars.filter(element => {
      return element._id != product._id.toString()
    })
  
    similars.slice(12)
  
    res.render('showpage/product', {product, sizeQuery, from, similars, completeYourLook, recentlySeen })
  } catch (error) {
    res.render('404')
  }
})

router.get('/designers/:designer', async (req, res) => {
  let { designer } = req.params;
  let { categoryQuery, sizeQuery, sortBy, isOpen, nPage  } = req.query;
  nPage = nPage ? nPage : 1
  isOpen = isOpen == "true" || isOpen == true ? true : false;
  const designers = process.env.DESIGNERS.split(' ')
  
  if(!designers.includes(designer)){
    return res.render('404')
  }
  if(designer == 'versace'){
    designer = 'VERSACE';
  }
  else if(designer == 'fendi'){
    designer = 'FENDI';
  }
  else if(designer == 'balmain'){
    designer = 'BALMAIN';
  }
  else if(designer == 'dsquared2'){
    designer = 'DSQUARED2';
  }
  else if(designer == 'valentino'){
    designer = 'VALENTINO';
  }
  else if(designer == 'philipp-plein'){
    designer = 'PHILIPP PLEIN';
  }
  else if(designer == 'palm-angels'){
    designer = 'PALM ANGELS';
  }
  else if(designer == 'marcelo-burlon'){
    designer = 'MARCELO BURLON';
  }

  let products;
  if(categoryQuery){
    products = await Product.find({category : categoryQuery, designer : req.params.designer, draft: false, deleted: false})
  }else{
    products = await Product.find({designer : req.params.designer, draft: false, deleted: false})
  }
  if(sizeQuery){
    products = products.filter(product => {
      const filter = product.sizes.filter(size => {
        if(size.remaining != 0){
          return size.size == sizeQuery
        }
        return false
      })
      return filter.length
    })
  }
  if(sortBy){
    if(sortBy == 'most-recent'){
      products = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if(sortBy == 'rising-price'){
      products = products.sort((a, b) => a.discountedPrice - b.discountedPrice)
    } else{
      products = products.sort((a, b) => b.discountedPrice - a.discountedPrice)
    }
  }else{
    products = products.sort((a, b) => a.modelName.localeCompare(b.modelName))
  }

  if(categoryQuery == 'jackets'){
    categoryQuery = 'GIACCHE';
  }
  else if(categoryQuery == 'hoodies'){
    categoryQuery = 'FELPE CON CAPPUCCIO';
  }
  else if(categoryQuery == 'sweatshirts'){
    categoryQuery = 'FELPE';
  }
  else if(categoryQuery == 'shirts'){
    categoryQuery = 'CAMICIE';
  }
  else if(categoryQuery == 'polos'){
    categoryQuery = 'POLO';
  }
  else if(categoryQuery == 't-shirts'){
    categoryQuery = 'T-SHIRT';
  }
  else if(categoryQuery == 'jeans'){
    categoryQuery = 'JEANS';
  }
  else if(categoryQuery == 'trousers'){
    categoryQuery = 'PANTALONI';
  }
  else if (categoryQuery =='bermuda'){
    categoryQuery = 'BERMUDA';
  }
 
  const accessories = 'Portafoglio e Piccola Pelletteria/Customi da Bagno/Ciabatte'
  const clothing = 'Giacche/Felpe con cappuccio/Felpe/Camicie/Polo/T-shirt/Jeans/Pantaloni/Bermuda';
  const categories = accessories.split('/').concat(clothing.split('/'));

  res.render('showpage/designers', { products, categoryQuery, sizeQuery, sortBy, designer, categories, isOpen, nPage });
})
router.get('/clothing/:category', async (req, res) => {
  let { category } = req.params;
  let { designerQuery, sizeQuery, sortBy, isOpen, nPage  } = req.query;
  nPage = nPage ? nPage : 1
  isOpen = isOpen == "true" || isOpen == true ? true : false;
  const clothing = process.env.CLOTHING.split(' ')
  const designers = process.env.DESIGNERS.split(' ')
  if(!clothing.includes(category)){
    return res.render('404')
  }
  if(category == 'jackets'){
    category = 'GIACCHE';
  }
  else if(category == 'hoodies'){
    category = 'FELPE CON CAPPUCCIO';
  }
  else if(category == 'sweatshirts'){
    category = 'FELPE';
  }
  else if(category == 'shirts'){
    category = 'CAMICIE';
  }
  else if(category == 'polos'){
    category = 'POLO';
  }
  else if(category == 't-shirts'){
    category = 'T-SHIRT';
  }
  else if(category == 'jeans'){
    category = 'JEANS';
  }
  else if(category == 'trousers'){
    category = 'PANTALONI';
  }
  else if (category =='bermuda'){
    category = 'BERMUDA';
  }

  let products;
  if(designerQuery){
    products = await Product.find({category : req.params.category, designer : designerQuery, draft: false, deleted: false})
  }else{
    products = await Product.find({category : req.params.category, draft: false, deleted: false})
  }
  if(sizeQuery){
    products = products.filter(product => {
      const filter = product.sizes.filter(size => {
        if(size.remaining != 0){
          return size.size == sizeQuery
        }
        return false
      })
      return filter.length
    })
  }
  if(sortBy){
    if(sortBy == 'most-recent'){
      products = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if(sortBy == 'rising-price'){
      products = products.sort((a, b) => a.discountedPrice - b.discountedPrice)
    } else{
      products = products.sort((a, b) => b.discountedPrice - a.discountedPrice)
    }
  }else{
    products = products.sort((a, b) => a.modelName.localeCompare(b.modelName))
  }
 
  res.render('showpage/category', { category, products, designers, designerQuery, sizeQuery, sortBy, isOpen, nPage });
})

router.get('/accessories/:category', async (req, res) => {
  let { category } = req.params;
  let { designerQuery, sizeQuery, sortBy, isOpen, nPage  } = req.query;
  nPage = nPage ? nPage : 1
  isOpen = isOpen == "true" || isOpen == true ? true : false;
  const clothing = process.env.ACCESSORIES.split(' ')
  const designers = process.env.DESIGNERS.split(' ')
  
  if(!clothing.includes(category)){
    return res.render('404')
  }
  if(category == 'wallets-and-small-leather-goods'){
    category = 'PORTAFOGLIO E PICCOLA PELLETTERIA';
  }
  else if(category == 'swimwear'){
    category = 'CUSTOMI DA BAGNO';
  }
  else if(category == 'slippers'){
    category = 'CIABATTE';
  }

  let products;
  if(designerQuery){
    products = await Product.find({category : req.params.category, designer : designerQuery, draft: false, deleted: false})
  }else{
    products = await Product.find({category : req.params.category, draft: false, deleted: false})
  }
  if(sizeQuery){
    products = products.filter(product => {
      const filter = product.sizes.filter(size => {
        if(size.remaining != 0){
          return size.size == sizeQuery
        }
        return false
      })
      return filter.length
    })
  }
  if(sortBy){
    if(sortBy == 'most-recent'){
      products = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if(sortBy == 'rising-price'){
      products = products.sort((a, b) => a.discountedPrice - b.discountedPrice)
    } else{
      products = products.sort((a, b) => b.discountedPrice - a.discountedPrice)
    }
  }else{
    products = products.sort((a, b) => a.modelName.localeCompare(b.modelName))
  }
 

  res.render('showpage/accessories', { category, products, designers, designerQuery, sizeQuery, sortBy, isOpen, nPage });
})

router.post('/wishlist/:id', async (req, res)=> {
  try {
    const product = await Product.findById(req.params.id);
    if(product){
      if(!req.session.wishlist){
        req.session.wishlist = []
      }
      if(req.session.wishlist.includes(product._id.toString())){
        req.session.wishlist.splice(req.session.wishlist.indexOf(product._id.toString()), 1)
        req.session.wishlist.unshift(product._id.toString())
      }else{
        req.session.wishlist.unshift(product._id.toString())
        req.session.wishlist.splice(12)
      }
      
      return res.send('success')
  
    }else{
      req.flash('error', `Impossibile aggiungere il prodotto alla wishlist`);
      return res.redirect('/')
    }
  } catch (error) {
    req.flash('error', "Invalid ID")
    return res.redirect('/')
  }
})
router.delete('/wishlist/:id', async (req, res)=> {
  try {
    const product = await Product.findById(req.params.id);
    if(product){
  
      if(!req.session.wishlist){
        res.send('error')
      }
      if(req.session.wishlist.includes(product._id.toString())){
        req.session.wishlist.splice(req.session.wishlist.indexOf(product._id.toString(), 0), 1)
        res.send('success')
      }else{
        res.send('error')
      }
  
    }else{
      req.flash('error', `Impossibile aggiungere il prodotto alla wishlist`);
      return res.redirect('/')
    }
  } catch (error) {
    req.flash('error', "Invalid ID")
    return res.redirect('/')
  }
})

router.post('/cart/:id', async (req, res)=> {
  const { size } = req.query;
  let product;
  try {
    product = await Product.findById(req.params.id);
  } catch (error) {
    req.flash('error', "Invalid ID")
    return res.redirect('/')
  }
  if(product){
    if(!size){
      req.flash('error', 'Inserisci una taglia valida')
      return res.redirect('/product/' + product._id)
    }
    if(!req.session.cart){
      req.session.cart = []
    }

    let passed = false;
    for(item of product.sizes){
      if(item.size == size){
        passed = true
      }
    }
    if(!passed){
      return res.send('error')
    }


    let remaining;
    product.sizes.forEach((sizeProduct) => {
      if(sizeProduct.size == size){
        remaining = sizeProduct.remaining;
      }
    })
    const choosen = req.session.cart.filter(cart => {
      return cart.product == product._id && cart.size == size
    })
    
    if(choosen.length){
      if(choosen[0].copies + 1 > remaining){
        return res.send(JSON.stringify({status: 'unavailable'}))
      }
    }


    let cartItemID;

    let contains = false;
    let indexProduct;
    req.session.cart.forEach((cart, index) => {
      if(cart.product == product._id.toString() && cart.size == size){
        cartItemID = cart.id
        contains = true
        indexProduct = index
      }
    })
    if(contains){
      req.session.cart[indexProduct].copies = req.session.cart[indexProduct].copies + 1
    }else{
      if(req.session.cart.length > 20){
        return res.send(JSON.stringify({status: 'error'}))
      }
      cartItemID = uuidv4();
      req.session.cart.push({
        id:  cartItemID,
        product: product._id,
        size: size,
        copies: 1
      })
    }
    
    return res.send(JSON.stringify({status: 'success', id: cartItemID}))

  }else{
    req.flash('error', `Impossibile aggiungere il prodotto al carrello`);
    return res.redirect('/')
  }
})
router.delete('/cart/:id', async (req, res)=> {
  const { size } = req.query;
  try {
    const product = await Product.findById(req.params.id);
    if(product){
      if(!size){
        req.flash('error', 'Inserisci una taglia valida')
        return res.redirect('/product/' + product._id)
      }
      if(!req.session.cart){
        req.session.cart = []
      }
  
      let contains = false;
      let indexProduct;
      req.session.cart.forEach((cart, index) => {
        if(cart.product == product._id.toString() && cart.size == size){
          contains = true
          indexProduct = index
        }
      })
      if(contains){
        let cartItemID;
        if(req.session.cart[indexProduct].copies - 1 == 0){
          req.session.cart = req.session.cart.filter(cartItem => {
            if(cartItem.product.toString() != product._id.toString() || cartItem.size != size){
                cartItemID = cartItem.product.toString();
            }
            return cartItem.product.toString() != product._id.toString() || cartItem.size != size
          })
          if(req.session.cart.length == 0){
            return res.send(JSON.stringify({status: 'product-removed-from-cart', id: cartItemID, lastOne: true }))
          }
          return res.send(JSON.stringify({status: 'product-removed-from-cart', id: cartItemID }))
        }
        req.session.cart[indexProduct].copies = req.session.cart[indexProduct].copies - 1
        cartItemID = req.session.cart[indexProduct].id
        return res.send(JSON.stringify({status: 'product-removed', id: cartItemID }))
      }
      else{
        req.flash('error', 'Inserisci una taglia valida')
        return res.redirect('/product/' + product._id)
      }
  
    }else{
      req.flash('error', `Impossibile trovare il prodotto`);
      return res.redirect('/')
    }
  } catch (error) {
    req.flash('error', "Invalid id")
    return res.redirect('/')
  }
})

router.get('/newarrivals', async (req, res) => {

  let products = await Product.find({draft: false, deleted: false})

  var date = new Date();
  date.setDate(date.getDate() - 30);

  products = products.filter(product => {
    return product.createdAt.getTime() > date.getTime()
  })

  products = products.sort((a, b) => {
    return 0.5 - Math.random()
  })

  products = products.slice(20)

  res.render('showpage/new-arrivals', { products })

})

router.get('/search', async (req, res) => {
  const { search } = req.query;
  let products = await Product.find({draft: false, deleted: false})

  products = products.filter(product => {
    if(product.modelName.trim().replace(' ', '').replace('-', '').toLowerCase().includes(search.trim().replace(' ', '').replace('-', '').toLowerCase())){
      return true;
    }
    if(product.modelName.trim().replace(' ', '').replace('-', '').toLowerCase().includes('dsquared2')){
      if(product.modelName.trim().replace(' ', '').replace('-', '').toLowerCase().replace('dsquared2', 'dsquared').includes(search.trim().replace(' ', '').replace('-', '').toLowerCase())){
        return true
      }
    }
    return false;
  })

  res.render('showpage/search', { products, search })

})

module.exports = router;