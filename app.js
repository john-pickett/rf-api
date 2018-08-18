const express = require('express');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request-promise');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose');
const {ObjectID} = require('mongodb');

const {Site} = require('./models/site');
const {Recipe} = require('./models/recipe');
const {User} = require('./models/user');
const {Bunny} = require('./models/bunny');

// *** ElasticSearch ***
var bonsai_url    = process.env.BONSAI_URL;
var elasticsearch = require('elasticsearch');
var client        = new elasticsearch.Client({
                        host: bonsai_url,
                        log: 'trace' 
                    });

//  *** Routing and Parsing Files ***
// const parser = require('./routes/parser.js');
// const scraper = require('./routes/scraper.js');
// const jcbparse = require('./routes/JOCB/jcbparse');
const tester = require('./routes/test');
const parseSimply = require('./routes/Simply/simply-xmlparse');
const parseJocb = require('./routes/JOCB/jocbparse');
const jocb = require('./routes/JOCB/jocb-schema');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Started up at ${port}`);
    // jocb.jocb.crawl();
    // console.log(jocb)
})

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH");
    next();
  });

// Recipe Routes
app.get('/recipes', (req, res) => {
    // console.log('/recipes...')
    Recipe.find().then((recipes) => {
        res.send({recipes});
    }, (e) => {
        res.status(404).send(e);
    })
});

// User search recipes
app.get('/recipes/:query', (req, res) => {
    let query = req.params.query;
    // console.log('query: ' + query);
    //Model.find({ $text : { $search : "text to look for" } }, 

    Recipe.find({ $text : { $search: '"' + query + '"' } }, { score: { $meta: "textScore" } })
    .sort( { score: { $meta: "textScore" } }).then((recipe) => {
            res.send({recipe})
        }).catch((e) => {
            res.status(400)
        });


    /*
    // ES search function
    Recipe.search({
        query_string: {
          query: query
        }
      }, function(err, results) {
        if (err) {
            console.log('err: ' + err);
        }
        res.send(results);
      });
      */
});

// Create new recipe
app.post('/recipe', (req, res) => {
    console.log(JSON.stringify(req.body))
    let recipe = new Recipe({
        title: req.body.title,
        url: req.body.url,
        image: req.body.image
    })
    
    recipe.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/bonsai', (req, res) => {
    
    // Test the connection:
    // Send a HEAD request to "/" and allow
    // up to 30 seconds for it to complete.
    client.ping({
      requestTimeout: 30000,
    }, function (error) {
      if (error) {
        console.error('elasticsearch cluster is down!');
      } else {
        console.log('All is well');
      }
    });
})

// Site Routes
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

// User Routes
app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send({users});
    }, (e) => {
        res.status(404).send(e);
    })
});


app.get('/users/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    User.findById(id).then((user) => {
        if (!user) {
            return res.status(404).send();
        }

        res.send({user})
    }).catch((e) => {
        res.status(400).send();
    })
});

// Favorite routes
app.get('/favorites/:id', (req, res) => {
    // user id comes in, recipe objects go out

    const userId = req.params.id;
    let favRecipes = [];
    let counter = 0;

    if (!ObjectID.isValid(userId)) {
        console.log('error')
        return res.status(404).send();
    }

    const sendMe = (input) => {
        res.send(input)
    }

    User.findById(userId).then((user) => {
        // we have the right user => Mary
        // console.log('name: ' + user.name);

        // we have the recipe IDs
        const favs = user.favorites;
        // if no favorites for user yet
        if (!favs.length) {
            res.status(200).send([]);
        }

        favs.forEach((fav, i) => {
            Recipe.find({
                '_id': { $in: [
                    mongoose.Types.ObjectId(fav)
                ]}
            }).then((recipe) => {
                counter++;
                // console.log("recipe: " + JSON.stringify(recipe, null, 2))
                favRecipes.push(recipe)
                if(counter === favs.length) {
                    sendMe(favRecipes)
                } 
            });
        });
    });
});

app.post('/favorite/user/:userId/recipe/:recipeId', (req, res) => {
    // user ID and recipe ID come in
    // favorite gets saved
    // new user object goes back

    let userId = req.params.userId;
    let recipeId = req.params.recipeId;

    User.findById(userId).then((user) => {
        user.favorites.push(recipeId);
        user.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.status(400).send(e);
        })
    })
});

app.delete('/favorite/user/:userId/recipe/:recipeId', (req, res) => {
    console.log('removing favorite');
    // user ID and recipe ID come in
    // recipe gets removed from favorites
    // new user object goes back

    let userId = req.params.userId;
    let recipeId = req.params.recipeId;

    User.findById(userId).then((user) => {
        //user.favorites.push(recipeId);
        let index = user.favorites.indexOf(recipeId);
        user.favorites.splice(index, 1);

        user.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.status(400).send(e);
        })
    });

});

// Bunny routes
app.post('/bunny', (req, res) => {
    console.log(JSON.stringify(req.body))
    let bunny = new Bunny({
        name: req.body.name,
        age: req.body.age,
        cuteness: req.body.cuteness
    })
    
    bunny.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/bunny/:query', (req, res) => {
    let query = req.params.query;
    console.log('query: ' + query);

    Bunny.search({
        query_string: {
          query: query
        }
      }, function(err, results) {
        if (err) {
            console.log('err: ' + err);
        }
        res.send(results);
      });
})

// Schema routes

app.get('/jocb', (req, res) => {
    schedule;
})