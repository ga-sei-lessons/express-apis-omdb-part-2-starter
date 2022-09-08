require('dotenv').config();
const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const app = express();
const axios = require('axios')
const db = require('./models')

// Sets EJS as the view engine
app.set('view engine', 'ejs');
// Specifies the location of the static assets folder
app.use(express.static('static'));
// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));
// Enables EJS Layouts middleware
app.use(ejsLayouts);

// Adds some logging to each request
app.use(require('morgan')('dev'));

// Routes
app.get('/', function(req, res) {
  res.render('index.ejs')
})

app.get('/results', (req, res) => {
  axios.get(`http://www.omdbapi.com/?s=${req.query.movieSearch}&apikey=${process.env.OMDB_API_KEY}`)
    .then(response => {
      res.render('results.ejs', { movies: response.data.Search })
    })
    .catch(console.log)
})

app.get('/details/:id', (req, res) => {
  console.log(req.params.id)
  axios.get(`http://www.omdbapi.com/?i=${req.params.id}&apikey=${process.env.OMDB_API_KEY}`)
    .then(response => {
      console.log(response.data)
      res.render('detail.ejs', { movie: response.data })
    })
    .catch(console.log)
})

// FAVES routes
// GET /faves -- READ all faves and display them to the user
app.get('/faves', async (req, res) => {
    try {
      // find all of the user's favs in the db
      const allFaves = await db.fave.findAll()
      // render a template with the user's faves
      res.render('faves.ejs', { allFaves })
    } catch(err) {
      console.log(err)
      res.send('server error')
    }
})

// POST /faves -- CREATE new fave and redirect to /faves to display user faves
app.post('/faves', async (req, res) => {
  try {
    console.log(req.body)
    // add the new favorite to the db
    await db.fave.create(req.body)
    // redirect to the user's profile with their faves
    res.redirect('/faves')
  } catch(err) {
    console.log(err)
    res.send('server error')
  }
})

app.listen(process.env.PORT || 3000);