// basic dependencies
const path = require('path');
if(process.env.NODE_ENV !== 'production') require('dotenv').config();

// mongodb
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/attualitystore`
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// express
const express = require('express');
const app = express();

// Cookie parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// sessions
const session = require('express-session');
var MongoDBStore = require('connect-mongo');
const store = MongoDBStore.create({
  mongoUrl: MONGO_URI,
  ttl: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 12)
});
store.on('error', function(error) {
    console.log(error);
});
const sessionConfig = {
  store: store,
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 12),
  },
};
app.use(session(sessionConfig))
module.exports = store

// helmet
const helmet = require("helmet");
app.use(helmet());
const scriptSrcUrls = [
  "https://cdnjs.cloudflare.com/ajax/libs/uuid/8.1.0/uuidv4.min.js",
  "https://unpkg.com/flowbite@1.4.7/dist/flowbite.js", 
  "http://code.jquery.com", 
  "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/tw-elements/dist/js/index.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js@3.8.0/dist/chart.min.js",
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  "https://cdnjs.cloudflare.com/ajax/libs/jquery.payment/1.0.1/jquery.payment.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/3.3.4/jquery.inputmask.bundle.min.js",
  "https://js.stripe.com/",
  "https://cdn.jsdelivr.net/gh/stevenschobert/instafeed.js@2.0.0rc1/src/instafeed.min.js",
  "https://unpkg.com/flowbite@1.4.7/dist/datepicker.js"
];
const styleSrcUrls = [
  "https://fonts.googleapis.com/",
  "https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css",
  "https://cdn.jsdelivr.net/npm/tw-elements/dist/css/index.min.css",
  "https://cdn.jsdelivr.net/npm/daisyui@2.15.2/dist/full.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.6/css/flag-icon.min.css",
  "https://unpkg.com/flowbite@1.4.7/dist/flowbite.min.css"
];
const connectSrcUrls = [
  "https://graph.instagram.com/"
];
const fontSrcUrls = [
  "fonts.gstatic.com",
];
const imgSrc = [
  "https://res.cloudinary.com/attuality-store/",
  "https://*.cdninstagram.com/",
  "https://cdn.shopify.com/",
];
const defaultSrc = [
  "https://js.stripe.com/"
]
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [...defaultSrc],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              ...imgSrc,
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

// passport-local
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email'}, User.authenticate()));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

//flash 
const flash = require('connect-flash');
app.use(flash());

// methodOverride
const methodOverride = require('method-override');
app.use(methodOverride('_method'))

// bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/webhook', bodyParser.raw({type: "*/*"}));
app.use(bodyParser.json());

// Mongo sanitizer
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());


// models
const Product = require('./models/product');
const Order = require('./models/order');

// TODO add order count only on admin routes
app.use('/user/admin', async (req, res, next) => {
  const ordersCount = await Order.count({completed: false})
  res.locals.ordersCount = ordersCount;
  next()
})

// locals
app.use(async (req, res, next) => {
  res.locals.user = req.user;
  res.locals.wishlist = req.session.wishlist || [];
  let sessionCart = [];
  let elements = []
  if(!req.session.cart){
    req.session.cart = []
  }
  if(req.session.cart && req.session.cart.length){
    for(element of req.session.cart){
      elements.push(element._id)
    }
    for(element of req.session.cart){
      try {
        let product = await Product.findById(element.product)
        let passed = true;
        if(product.draft || product.deleted){
          passed = false
        }else{
          for(size of product.sizes){
            if(size.size == element.size){
              passed = true
              if(size.remaining == 0){
                passed = false;
              }
              else if(size.remaining < element.copies){
                element.copies = size.remaining
              }
            }
          }
        }
        if(passed){
          sessionCart.push({
            id: element.id,
            product: product,
            size: element.size,
            copies: element.copies
          })
        }else{
          req.session.cart.splice(req.session.cart.indexOf(element), 1)
        }
      } catch (error) {
        req.flash('error', "Internal server error")
        return res.redirect('/')
      }
    }
  }
  res.locals.cart = sessionCart;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  // TODO create a local that count every element for every category
  let categoriesCounting = {
    jackets: 0,
    hoodies: 0,
    sweatshirts: 0,
    't-shirts': 0,
    polos: 0,
    jeans: 0,
    trousers: 0,
    bermuda: 0,
    shirts: 0,
    slippers: 0,
    'wallets-and-small-leather-goods': 0,
    swimwear: 0
  }
  // find all product and then change categories obj with the number of product in each category
  try {
    let products = await Product.find({})
    for(elementProduct of products){
      if(!elementProduct.draft && !elementProduct.deleted){
        if (elementProduct.category.includes("jackets")) {
          categoriesCounting.jackets++;
        }
        if (elementProduct.category.includes("hoodies")) {
          categoriesCounting.hoodies++;
        }
        if (elementProduct.category.includes("sweatshirts")) {
          categoriesCounting.sweatshirts++;
        }
        if (elementProduct.category.includes("t-shirts")) {
          categoriesCounting["t-shirts"]++;
        }
        if (elementProduct.category.includes("polos")) {
          categoriesCounting.polos++;
        }
        if (elementProduct.category.includes("jeans")) {
          categoriesCounting.jeans++;
        }
        if (elementProduct.category.includes("trousers")) {
          categoriesCounting.trousers++;
        }
        if (elementProduct.category.includes("bermuda")) {
          categoriesCounting.bermuda++;
        }
        if (elementProduct.category.includes("shirts")) {
          categoriesCounting.shirts++;
        }
        if (elementProduct.category.includes("slippers")) {
          categoriesCounting.slippers++;
        }
        if (elementProduct.category.includes("wallets-and-small-leather-goods")) {
          categoriesCounting["wallets-and-small-leather-goods"]++;
        }
        if (elementProduct.category.includes("swimwear")) {
          categoriesCounting.swimwear++;
        }
      }
    }
  } catch (error) {
    req.flash('error', "Internal server error")
    return res.redirect('/')
  }
  res.locals.categoriesCount = categoriesCounting;

  // find all product and then change designer obj with the number of product in each category
  let designersCounting = {
    'versace': 0,
    'fendi': 0,
    'balmain': 0,
    'philipp-plein': 0,
    'valentino': 0,
    'palm-angels': 0,
    'marcelo-burlon': 0,
    'dsquared2': 0,
  }
  // find all product and then change designers obj with the number of product in each designer
  try {
    let products = await Product.find({})
    for(elementProduct of products){
      if(!elementProduct.draft && !elementProduct.deleted){
        if (elementProduct.designer.includes("versace")) {
          designersCounting.versace++;
        }
        if (elementProduct.designer.includes("fendi")) {
          designersCounting.fendi++;
        }
        if (elementProduct.designer.includes("balmain")) {
          designersCounting.balmain++;
        }
        if (elementProduct.designer.includes("philipp-plein")) {
          designersCounting["philipp-plein"]++;
        }
        if (elementProduct.designer.includes("valentino")) {
          designersCounting.valentino++;
        }
        if (elementProduct.designer.includes("palm-angels")) {
          designersCounting["palm-angels"]++;
        }
        if (elementProduct.designer.includes("marcelo-burlon")) {
          designersCounting["marcelo-burlon"]++;
        }
        if (elementProduct.designer.includes("dsquared2")) {
          designersCounting.dsquared2++;
        }
      }
    }

  } catch (error) {
    req.flash('error', "Internal server error")
    return res.redirect('/')
  }
  res.locals.designersCount = designersCounting;


  next();
})
// set the important information in the session
const { v4: uuidv4 } = require('uuid');
const { lookup } = require('geoip-lite');
const device = require('express-device');

app.use(device.capture())

app.use(async (req, res, next) => {
  if(!req.session.device){
    req.session.device = req.device.type
  }
  if(!req.session.landingPage){
    req.session.landingPage = req.originalUrl.split('?')[0]
  }
  if(req.session.landingPage.split('.').length > 1){
    req.session.destroy()
    return next()
  }
  if(req.originalUrl.split('?')[0] == '/webhook'){
    req.session.destroy()
    return next()
  }
  if(!req.session.referrer){
    req.session.referrer = req.get('Referrer') || 'unknown'
  }
  if(!req.session.createdAt){
    req.session.createdAt = new Date()
  }
  if(!req.session.country){
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    req.session.country = lookup(ip) ? lookup(ip).country : 'unknown'
  }
  if(!req.session.uuid){
    req.session.uuid = uuidv4()
  }
  if(!req.session.sid){
    req.session.sid = req.sessionID
  }
  req.session.lastSeen = new Date()

  next()
})

// views
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// public
app.use(express.static(path.join(__dirname, '/public')));

// images
app.use(express.static(path.join(__dirname + '/images')))

// routes
app.get('/', async (req, res) => {
  let products = await Product.find({draft: false, deleted: false});
  products = products.sort((a,b) => {
    return 0.5 - Math.random();
  })
  for(item of products){
    let passed = false;  
    for(size of item.sizes){
      if(size.remaining > 0){
        passed = true;
        break
      }
    }
    if(!passed){
      products.splice(products.indexOf(item), 1)
    }
  }
  products = products.slice(0, 10)
  res.render('home', { products });
})

app.get('/searchsuggestions', async (req, res) => {
  const {search} = req.query;
  let products = await Product.find({})
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
  products = products.sort((a,b) => 0.5 - Math.random());
  products = products.slice(0, 4)
  
  res.send(products)
})

app.get('/destroycart', (req, res) => {
  req.session.cart = [];
  return res.redirect('/')
})

const ordersRouters = require('./routes/orders')
app.use('/', ordersRouters)

const showPageRoutes = require('./routes/showPage');
app.use('/', showPageRoutes);

const userRoutes = require('./routes/user');
app.use('/', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/', adminRoutes);

const infoRoutes = require('./routes/info');
const product = require('./models/product');
app.use('/', infoRoutes);


app.use((req ,res, next) => {
  res.status(404).render('404')
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})