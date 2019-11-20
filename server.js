if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY
const axios = require('axios')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
var router = express.Router();
var path = __dirname + '/views/';
const methodOverride = require('method-override')


const initializaPassport = require('./passport-config')
initializaPassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-enginer','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use('/assets', express.static('assets'));
app.use(express.json())
app.use(express.static('views'))

app.post('/weather', (req, res) => {
  const url = `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${req.body.latitude},${req.body.longitude}?units=auto`
  axios({
      url: url,
      responseType: 'json'
  }).then(data => res.json(data.data.currently))
})

app.post('/cityWeather', (req, res) => {
  const url = `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${req.body.latitude},${req.body.longitude}?units=auto`
  axios({
      url: url,
      responseType: 'json'
  }).then(data => res.json(data.data.currently))
})

app.get('/',checkAuthenticated, (req, res) => {
    res.render('index.ejs',{name : req.user.name})
  })

app.get('/login',checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })

app.post('/login',checkNotAuthenticated, passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
})) 


app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })

//entire application for registering users
app.post('/register',checkNotAuthenticated,async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), //if got database not need worry about this step
            name: req.body.name, //name from the request
            email:req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }catch{
        res.redirect('/register')

    }
  }) 
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect('/')
    }
  next()
  }

  router.use(function (req,res,next) {
    console.log("/" + req.method);
    next();
  });
  
  router.get("/",function(req,res){
    res.sendFile(path + "index.ejs");
  });
  
  router.get("/map",function(req,res){
    res.sendFile(path + "map.html");
  });
  
  router.get("/contact",function(req,res){
    res.sendFile(path + "contact.html");
  });

  router.get("/build",function(req,res){
    res.sendFile(path + "build.html");
  });
  
  app.use("/",router);
  
  app.use("*",function(req,res){
    res.sendFile(path + "404.html");
  });
  


app.listen(process.env.PORT ||3000, ()=>{
  console.log('Server Started')
})