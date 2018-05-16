const express = require('express');
// const parser = require('./routes/parser.js');
// const scraper = require('./routes/scraper.js');
// const jcbparse = require('./routes/jcbparse');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request-promise');
var {mongoose} = require('./db/mongoose');
const {Site} = require('./models/site');
const {Recipe} = require('./models/recipe');


const app = express();
const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Started up at ${port}`)
})

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH");
    next();
  });

  app.get('/recipes', (req, res) => {
      console.log('/recipes...')
    Recipe.find().then((recipes) => {
        res.send({recipes});
    }, (e) => {
        res.status(404).send(e);
    })
});

app.get('/recipes/:query', (req, res) => {
    console.log('query incoming...')
    let query = req.params.query;
    //Model.find({ $text : { $search : "text to look for" } }, 

    Recipe.find({ $text : { $search: 'chicken'}}).then((recipe) => {
            res.send({recipe})
        }).catch((e) => {
            res.status(400)
        });

    /*
    "_id": "5afad243ed367850e08b4674",
    "title": "",
    "url": "https://www.justonecookbook.com/3-year-blog-anniversary/",
    "lastmod": "2015-05-10T20:43:44-07:00",
    "__v": 0

      */
});


app.get('/sites', (req, res) => {
    Site.find().then((sites) => {
        res.send({sites});
    }, (e) => {
        res.status(404).send(e);
    })
});

