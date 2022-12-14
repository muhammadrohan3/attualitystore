if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express')
const router = express.Router();
const Product = require('../models/product')
const Order = require('../models/order')
const User = require('../models/user')
const nodemailer = require('nodemailer');
const product = require('../models/product');
const { checkoutSchema, emailSchema } = require("../schemas");
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
});
const { v4: uuidv4 } = require('uuid');

// stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET)

router.get('/checkout', (req, res) => {
  if(req.session.cart && req.session.cart.length){
    req.session.checkoutReached = new Date()
    const key = process.env.STRIPE_KEY
    res.render('checkout', { key })
  }else{
    res.render('404')
  }
})
router.post('/checkout', async (req, res) => {
  try{
    req.body.number = req.body.number.replaceAll("-", "");
  }catch(e){
    return res.send('error')
  }
  let countriesPrice = {
    Francia: 22,
    Spagna: 20,
    USA: 27,
    Cina: 35,
    Italia: 0,
    Messico: 37,
    Germania: 18,
    Thailandia: 35,
    "Regno Unito": 25,
    Portogallo: 24,
    "Paesi Bassi": 21,
    Grecia: 30,
    Islanda: 28,
    Canada: 35,
    Australia: 60,
    Belgio: 20,
    Ungheria: 17,
    Polonia: 17,
    Argentina: 37,
    Turchia: 35,
  };

  if (req.body.cart) {
    if (req.body.cart.length == 0) {
      return res.send("error");
    }
  } else {
    return res.send("error");
  }
  const errCheckout = checkoutSchema.validate({
    name: req.body.name,
    surname: req.body.surname,
    number: req.body.number,
    address: req.body.address,
    zip: req.body.zip,
    city: req.body.city,
    province: req.body.province,
    paymentMethod: req.body.paymentMethod
  });
  if (errCheckout.error) {
    return res.send(errCheckout.error.message);
  }
  // controllo stato
  if (!Object.keys(countriesPrice).includes(req.body.state)) {
    return res.send("error");
  }
  const errorEmail = emailSchema.validate({
    email: req.body.email,
  });
  if (errorEmail.error) {
    return res.send(JSON.stringify({ status: "invalid-tld" }));
  }

  var isEqual = function (value, other) {
    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    var valueLen =
      type === "[object Array]" ? value.length : Object.keys(value).length;
    var otherLen =
      type === "[object Array]" ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    var compare = function (item1, item2) {
      // Get the object type
      var itemType = Object.prototype.toString.call(item1);

      // If an object or array, compare recursively
      if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
        if (!isEqual(item1, item2)) return false;
      }

      // Otherwise, do a simple comparison
      else {
        // If the two items are not the same type, return false
        if (itemType !== Object.prototype.toString.call(item2)) return false;

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (itemType === "[object Function]") {
          if (item1.toString() !== item2.toString()) return false;
        } else {
          if (item1 !== item2) return false;
        }
      }
    };

    // Compare properties
    if (type === "[object Array]") {
      for (var i = 0; i < valueLen; i++) {
        if (compare(value[i], other[i]) === false) return false;
      }
    } else {
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          if (compare(value[key], other[key]) === false) return false;
        }
      }
    }

    // If nothing failed, return true
    return true;
  };

  const tempCart = [];
  try {
    for (item of req.body.cart) {
      let cache;
      try {
        cache = await Product.findById(item.product);
        if(cache.draft || cache.deleted){
          return res.send(JSON.stringify({ status: "cart-changed" }));
        }
      } catch (error) {
        req.flash('error', 'Internal server error')
        return res.redirect('/')
      }
      tempCart.push({
        id: item.id,
        product: item.product._id,
        size: item.size,
        copies: item.copies,
      });
    }
    if (!isEqual(tempCart, req.session.cart)) {
      return res.send(JSON.stringify({ status: "cart-changed" }));
    }
  } catch (error) {
    return res.send('error')
  }

  // controllo carrello
  try {
    for (item of req.body.cart) {
      await Product.findById(item.product._id);
    }
  } catch (error) {
    return res.send("error");
  }
  for (item of req.body.cart) {
    if (!item.size) {
      return res.send("error");
    }
    if (Number.isNaN(parseInt(item.copies))) {
      return res.send("error");
    }
    if (!item.copies) {
      return res.send("error");
    }
    const product = await Product.findById(item.product._id);
    let productCopies = 0;
    product.sizes.forEach((size) => {
      if (size.size == item.size) {
        productCopies = size.remaining;
      }
    });
    if (item.copies > productCopies) {
      return res.send("error");
    }
  }
  if (req.body.paymentMethod == 'cash-on-delivery') {
    if (req.body.state != "Italia") {
      return res.send("error");
    }
  }

  let total = 0;
  for (item of req.body.cart) {
    total = total + item.product.discountedPrice * item.copies;
  }
  total = total + countriesPrice[req.body.state] * 100;

  let userBody = false;
  if (req.user) {
    userBody = JSON.stringify(req.user._id);
  }

  let cart = [];
  for (data of req.body.cart) {
    cart.push(
      JSON.stringify({
        product: data.product._id,
        price: data.product.discountedPrice,
        size: data.size,
        copies: data.copies,
      })
    );
  }

  let result;
  if (req.body.paymentMethod == 'card') {
    result = await stripe.paymentIntents.create({
      amount: total,
      currency: "eur",
      payment_method_types: ["card"],
      metadata: {
        suuid: req.session.uuid,
        user: userBody,
        number: req.body.number,
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        state: req.body.state,
        products: cart.toString(),
        zip: req.body.zip,
      },
    });

    res.send(JSON.stringify({ clientSecret: result.client_secret }));
  } else if(req.body.paymentMethod == 'cash-on-delivery') {
    const products = []
    for(item of cart.toString().split(',{')){
      if(cart.toString().split(',{').indexOf(item) == 0){
        const str = item
        products.push(JSON.parse(str))
      }else{
        const str = '{' + item
        products.push(JSON.parse(str))
      }
    }

    let order;
    try {
      const user = await User.findById(req.user._id)
      order = new Order({
        id: uuidv4(),
        suuid: req.session.uuid,
        products,
        user: user._id,
        paymentMethod: 'cash-on-delivery',
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        number: req.body.number.replaceAll('-', ''),
        state: req.body.state,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        zip: req.body.zip,
        amount: total,
        createdAt: new Date(),
        completed: false
      })

    } catch (error) {
      order = new Order({
        id: uuidv4(),
        suuid: req.session.uuid,
        products,
        paymentMethod: 'cash-on-delivery',
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        number: req.body.number.replaceAll('-', ''),
        state: req.body.state,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        zip: req.body.zip,
        amount: total,
        createdAt: new Date(),
        completed: false
      })

    }

    await order.save()
    // mandare mail ad admin
    var mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL_ADMIN,
      subject: 'NUOVO ORDINE!',
      text: `Hai un nuovo ordine: ${req.protocol + '://' + req.get('host')}/user/admin/orders/info/${ order.id }`
    };
    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
        console.log(error)
        req.flash('error', 'Internal server error')
        return res.redirect('/')
      }
    });

    for(item of req.body.cart){
      let product = await Product.findById(item.product);
      for(size of product.sizes){
        if(size.size == item.size){
          if(product.sizes[product.sizes.indexOf(size)].remaining - item.copies >= 0){
            product.sizes[product.sizes.indexOf(size)].remaining = product.sizes[product.sizes.indexOf(size)].remaining - item.copies
          }else{
            await Order.findByIdAndDelete(order._id)
            product.sizes[product.sizes.indexOf(size)].remaining = 0
          }
        }
      }
      await product.save()
    }
    for(item of req.body.cart){
      let passed = false;
      let product = await Product.findById(item.product);
      for(size of product.sizes){
        if(size.remaining > 0){
          passed = true
        }
      }
      if(!passed){
        await Product.findByIdAndUpdate(product._id, { draft: true })
      }
    }

    return res.send(JSON.stringify({ success: true, total }))
  }
})

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBH);
  } catch (err) {
    res.render('404')
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata;

      // creare ordine
      const products = []
      for(item of metadata.products.split(',{')){
        if(metadata.products.split(',{').indexOf(item) == 0){
          const str = item
          products.push(JSON.parse(str))
        }else{
          const str = '{' + item
          products.push(JSON.parse(str))
        }
      }

      let order;
      try {
        const user = await User.findById(metadata.user.replaceAll(`"`, ''))
        order = new Order({
          id: uuidv4(),
          suuid: metadata.suuid,
          products,
          user: user._id,
          paymentMethod: 'card',
          name: metadata.name,
          surname: metadata.surname,
          email: metadata.email,
          number: metadata.number.replaceAll('-', ''),
          state: metadata.state,
          address: metadata.address,
          city: metadata.city,
          province: metadata.province,
          zip: metadata.zip,
          amount: paymentIntent.amount,
          piid: paymentIntent.id,
          createdAt: new Date(),
          completed: false
        })

      } catch (error) {
        order = new Order({
          id: uuidv4(),
          suuid: metadata.suuid,
          products,
          paymentMethod: 'card',
          name: metadata.name,
          surname: metadata.surname,
          email: metadata.email,
          number: metadata.number.replaceAll('-', ''),
          state: metadata.state,
          address: metadata.address,
          city: metadata.city,
          province: metadata.province,
          zip: metadata.zip,
          amount: paymentIntent.amount,
          piid: paymentIntent.id,
          createdAt: new Date(),
          completed: false
        })
  
      }

      await order.save()
      // mandare mail ad admin
      var mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL_ADMIN,
        subject: 'NUOVO ORDINE!',
        text: `Hai un nuovo ordine: ${req.protocol + '://' + req.get('host')}/user/admin/orders/info/${ order.id }`
      };
      transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
          console.log(error)
          req.flash('error', 'Internal server error')
          return res.redirect('/')
        }
      });

      // mandare mail a cliente
      // var mailOptions = {
      //   from: process.env.EMAIL,
      //   to: metadata.email,
      //   subject: 'NUOVO ORDINE!',
      //   text: `Grazie per aver scelto attuality store, puoi tracciare il tuo pacco qui: ${req.protocol + '://' + req.get('host')}/user/order/${ order.id }`
      // };
      // transporter.sendMail(mailOptions, async function(error, info){
      //   if (error) {
      //       console.log(error);
      //       
      //   }
      // });


      for(item of products){
        let product = await Product.findById(item.product);
        for(size of product.sizes){
          if(size.size == item.size){

            if(product.sizes[product.sizes.indexOf(size)].remaining - item.copies >= 0){
              product.sizes[product.sizes.indexOf(size)].remaining = product.sizes[product.sizes.indexOf(size)].remaining - item.copies
            }else{
              product.sizes[product.sizes.indexOf(size)].remaining = 0
            }
          
          }
        }
        await product.save()
      }

      for(item of products){

        let passed = false;
        let product = await Product.findById(item.product);
        for(size of product.sizes){
          console.log(size)
          if(size.remaining > 0){
            passed = true
          }
        }

        if(!passed){
          await Product.findByIdAndUpdate(product._id, { draft: true })
        }

      }
      
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
})

router.get('/checkout/buynow/:id', async (req, res) => {
  const { id } = req.params;
  const { size } = req.query;

  let product;
  try {
    product = await Product.findById(id);
  } catch (error) {
    req.flash('error', 'Invalid ID')
    return res.redirect('/')
  }

  let passed = false;
  for(item of product.sizes){
    if(item.size == size){
      if(item.remaining > 0){
        passed = true;
      }
    }
  }

  if(!passed){
    req.flash('error', 'Invalid size')
    return res.redirect(`/product/${product.urlSlug}`)
  }

  const key = process.env.STRIPE_KEY;

  res.render('checkout-buynow', { key, product, size })
})
router.post('/checkout/buynow', async (req, res) => {
  try {
    req.body.number = req.body.number.replaceAll("-", "");
  } catch (e) {
    return res.send("error");
  }
  let countriesPrice = {
    Francia: 22,
    Spagna: 20,
    USA: 27,
    Cina: 35,
    Italia: 0,
    Messico: 37,
    Germania: 18,
    Thailandia: 35,
    "Regno Unito": 25,
    Portogallo: 24,
    "Paesi Bassi": 21,
    Grecia: 30,
    Islanda: 28,
    Canada: 35,
    Australia: 60,
    Belgio: 20,
    Ungheria: 17,
    Polonia: 17,
    Argentina: 37,
    Turchia: 35,
  };

  const errCheckout = checkoutSchema.validate({
    name: req.body.name,
    surname: req.body.surname,
    number: req.body.number,
    address: req.body.address,
    zip: req.body.zip,
    city: req.body.city,
    province: req.body.province,
    paymentMethod: req.body.paymentMethod
  });
  if (errCheckout.error) {
    return res.send(errCheckout.error.message);
  }
  // controllo stato
  if (!Object.keys(countriesPrice).includes(req.body.state)) {
    return res.send("error");
  }
  const errorEmail = emailSchema.validate({
    email: req.body.email,
  });
  if (errorEmail.error) {
    return res.send(JSON.stringify({ status: "invalid-tld" }));
  }
    if (req.body.cart) {
      if (req.body.cart.length == 0 || req.body.cart.length > 1) {
        return res.send("error");
      }
    } else {
      return res.send("error");
    }
  
  // controllo carrello
  let productCart;
  try {
    for (item of req.body.cart) {
      productCart = await Product.findById(item.product._id);
    }
  } catch (error) {
    return res.send("error");
  }
  for (item of req.body.cart) {
    if (!item.size) {
      return res.send("error");
    }
    let passed = false;
    for(element of productCart.sizes){
      if(element.size == item.size){
        passed = true
      }
    }
    if(!passed){
      return res.send('error')
    }
    if (Number.isNaN(parseInt(item.copies))) {
      return res.send("error");
    }
    if (!item.copies) {
      return res.send("error");
    }

    if(item.copies != 1){
      return res.send('error')
    }

    const product = await Product.findById(item.product._id);
    let productCopies = 0;
    product.sizes.forEach((size) => {
      if (size.size == item.size) {
        productCopies = size.remaining;
      }
    });
    if (item.copies > productCopies) {
      return res.send(JSON.stringify({ status: "cart-changed" }));
    }
    }
   if (req.body.paymentMethod == 'cash-on-delivery') {
     if (req.body.state != "Italia") {
       return res.send("error");
     }
   }
   const productInTheCart = await Product.findById(req.body.cart[0].product._id);
   if (productInTheCart.draft || productInTheCart.deleted) {
     return res.send(JSON.stringify({ status: "cart-changed-draft" }));
   }

  let total = 0;
  for (item of req.body.cart) {
    total = total + item.product.discountedPrice * item.copies;
  }
  total = total + countriesPrice[req.body.state] * 100;

  let userBody = false;
  if (req.user) {
    userBody = JSON.stringify(req.user._id);
  }

  let cart = [];
  for (data of req.body.cart) {
    cart.push(
      JSON.stringify({
        product: data.product._id,
        price: data.product.discountedPrice,
        size: data.size,
        copies: data.copies,
      })
    );
  }


  let result;
  if (req.body.paymentMethod == 'card') {
    result = await stripe.paymentIntents.create({
      amount: total,
      currency: "eur",
      payment_method_types: ["card"],
      metadata: {
        suuid: req.session.uuid,
        user: userBody,
        number: req.body.number,
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        state: req.body.state,
        products: cart.toString(),
        zip: req.body.zip,
      },
    });
    return res.send(JSON.stringify({ clientSecret: result.client_secret }));
  } else if(req.body.paymentMethod == 'cash-on-delivery') {
    const products = []
    for(item of cart.toString().split(',{')){
      if(cart.toString().split(',{').indexOf(item) == 0){
        const str = item
        products.push(JSON.parse(str))
      }else{
        const str = '{' + item
        products.push(JSON.parse(str))
      }
    }

    let order;
    try {
      const user = await User.findById(req.user._id)
      order = new Order({
        id: uuidv4(),
        suuid: req.session.uuid,
        products,
        user: user._id,
        paymentMethod: 'cash-on-delivery',
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        number: req.body.number.replaceAll('-', ''),
        state: req.body.state,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        zip: req.body.zip,
        amount: total,
        createdAt: new Date(),
        completed: false
      })

    } catch (error) {
      order = new Order({
        id: uuidv4(),
        suuid: req.session.uuid,
        products,
        paymentMethod: 'cash-on-delivery',
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        number: req.body.number.replaceAll('-', ''),
        state: req.body.state,
        address: req.body.address,
        city: req.body.city,
        province: req.body.province,
        zip: req.body.zip,
        amount: total,
        createdAt: new Date(),
        completed: false
      })

    }

    await order.save()


    // mandare mail ad admin
    var mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL_ADMIN,
      subject: 'NUOVO ORDINE!',
      text: `Hai un nuovo ordine: ${req.protocol + '://' + req.get('host')}/user/admin/orders/info/${ order.id }`
    };
    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
        console.log(error)
        req.flash('error', 'Internal server error')
        return res.redirect('/')
      }
    });

    for(item of req.body.cart){
      let product = await Product.findById(item.product);
      for(size of product.sizes){
        if(size.size == item.size){
          if(product.sizes[product.sizes.indexOf(size)].remaining - item.copies >= 0){
            product.sizes[product.sizes.indexOf(size)].remaining = product.sizes[product.sizes.indexOf(size)].remaining - item.copies
          }else{
            await Order.findByIdAndDelete(order._id)
            product.sizes[product.sizes.indexOf(size)].remaining = 0
          }
        }
      }
      await product.save()
    }
    for(item of req.body.cart){
      let passed = false;
      let product = await Product.findById(item.product);
      for(size of product.sizes){
        if(size.remaining > 0){
          passed = true
        }
      }
      if(!passed){
        await Product.findByIdAndUpdate(product._id, { draft: true })
      }
    }

    return res.send(JSON.stringify({ success: true, total }))
  }
})


module.exports = router;