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

// Routing and Parsing Files
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

// Recipe Routes
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

    Recipe.find({ $text : { $search: query } }, { score: { $meta: "textScore" } })
    .sort( { score: { $meta: "textScore" } }).then((recipe) => {
            res.send({recipe})
        }).catch((e) => {
            res.status(400)
        });

    /*
    db.stores.find( { $text: { $search: "java coffee shop" } },
        { score: { $meta: "textScore" } }
        ).sort( { score: { $meta: "textScore" } } )
    */

    
    /*
    "_id": "5afad243ed367850e08b4674",
    "title": "",
    "url": "https://www.justonecookbook.com/3-year-blog-anniversary/",
    "lastmod": "2015-05-10T20:43:44-07:00",
    "__v": 0

      */
});

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
    const userId = req.params.id;
    // console.log('user id: ' + userId);
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
        
        /*
        function callback () { console.log('all done'); }

var itemsProcessed = 0;

[1, 2, 3].forEach((item, index, array) => {
  asyncFunction(item, () => {
    itemsProcessed++;
    if(itemsProcessed === array.length) {
      callback();
    }
  });
});
        */

    // Story.findOne({ title: 'Casino Royale' }, function(error, story) {
    //     if (error) {
    //       return handleError(error);
    //     }
    //     story.author = author;
    //     console.log(story.author.name); // prints "Ian Fleming"
    //   });
    
    // get user from id
    // find user, get array of favorites (id)
    // get recipes by ID, send recipes

});

app.post('/favorite/user/:userId/recipe/:recipeId', (req, res) => {
    // send user ID and recipe ID
    // e.g., /favorite/user/:id/recipe/:id
    // find user
    // push recipe ID to user.favorites

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

    /*
    Route path: /users/:userId/books/:bookId
    Request URL: http://localhost:3000/users/34/books/8989
    req.params: { "userId": "34", "bookId": "8989" }
    */

    /*

    app.post('/users', (req, res, next) => {
        // console.log(req.body);
        var user = new User({
            name: req.body.name,
            email: req.body.email
        });
        user.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.status(400).send(e);
        })
    });
    */
});

/*
app.get('/lessons/:id', (req, res) => {
    var id = req.params.id;
    
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

   Lesson.findById(id).then((lesson) => {
    if (!lesson) {
        return res.status(404).send();
    }

    res.send({lesson});
   }).catch((e) => {
    res.status(400).send();
   })
});
*/

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