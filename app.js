const express = require('express');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request-promise');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
const {Site} = require('./models/site');
const {Recipe} = require('./models/recipe');

// const parser = require('./routes/parser.js');
// const scraper = require('./routes/scraper.js');
// const jcbparse = require('./routes/JOCB/jcbparse');
const tester = require('./routes/test');
const parseSimply = require('./routes/Simply/simply-xmlparse');
const parseJocb = require('./routes/JOCB/jocbparse');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

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
    // console.log('/recipes...')
    Recipe.find().then((recipes) => {
        res.send({recipes});
    }, (e) => {
        res.status(404).send(e);
    })
});

app.get('/recipes/:query', (req, res) => {
    let query = req.params.query;
    // console.log('query: ' + query);
    //Model.find({ $text : { $search : "text to look for" } }, 

    Recipe.find({ $text : { $search: query }}).then((recipe) => {
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

app.post('/sites', (req, res) => {
    // console.log(req)
    const site = new Site({
        title: req.body.title
    })
    site.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });

})

// app.get('/test', (req, res) => {
//     tester();
//     res.status(200).send();
// })

// app.get('/parse', (req, res) => {
//     console.log('calling parseMe');
//     parseSimply();
//     // parseJocb();
//     res.status(200).send('ok');
// })