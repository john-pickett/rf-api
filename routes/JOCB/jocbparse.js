var fs = require('fs'), xml2js = require('xml2js');
const {mongoose} = require('mongoose');
const Crawler = require('simplecrawler');
const cheerio = require('cheerio');

const {Site} = require('../../models/site');
const {Recipe} = require('../../models/recipe');

// uses simplecrawler to fetch data from the recipe webpage
const crawl = (url) => {
    return new Promise((resolve, reject) => {
        var crawler = new Crawler(url);
        // console.log('fetching ' + url)
        let recipeInfo = {};
        crawler.start();

        crawler.on("fetchcomplete", function(item, buffer, response) {
            console.log("I just received " + item.url);
            let $ = cheerio.load(buffer.toString("utf8"));
            // creating object of HTML data
            recipeInfo.title = $('h1.entry-title').text();
            recipeInfo.ingList = $("ul.wprm-recipe-ingredients li").map(function() {
                return $(this).text();
                }).toArray();
            crawler.stop();
            resolve(recipeInfo);
        });
        Promise.all(recipeInfo)
    }).catch((err) => {
        console.log('error: ' + err);
    });
}

// parses the xml document and turns it into a javascript object
const parseJocb = () => {
    let parsedData = [];
    let mappedRes = [];

    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/jocb.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            parsedData = result.urlset.url;
            //console.log(parsedData[5]['image:image'][0]['image:loc'][0])
            parsedData.forEach((item) =>{
                if (item['image:image']) {
                    mappedRes.push({
                        title: '',
                        url: item.loc[0],
                        // lastmod: item.lastmod[0],
                        image: item['image:image'][0]['image:loc'][0]
                    })
                } else {
                    mappedRes.push({ 
                        title: '', 
                        url: item.loc[0],
                        image: ''
                    })
                }
            })
        });
        // console.log('mappedRes: ' + JSON.stringify(mappedRes[0]));
        // console.log('mappedRes: ' + JSON.stringify(mappedRes[1]));
    
    // calls crawl() for each item in the Mapped Result
        async function getList(input) {
            for (const item of input) {

                // this is where the recipe object is created
                let recipe = await crawl(item.url)
                // console.log('getList ings are ' + ingredients);
                // console.log('recipe ' + JSON.stringify(recipe));
                item.title = recipe.title;
                item.image = recipe.image;
                item.ingredients = recipe.ingList;
                // Simply Recipes ObjectID
                item.website = '5b02a715cbf5b217846d39cf';
                // console.log('item ' + JSON.stringify(item, null, 2));
            }
            console.log('getList done')
        }

    // saves the finished object into Mongo
        getList(mappedRes).then(() => {
            Recipe.insertMany(mappedRes, function (err, recipe) {
                if (err) {
                  console.log(err);
                };
                console.log('recipes saved!');
            });
        }).catch((err) => {
            console.log('err ' + err);
        })
        
        
    });
}

module.exports = parseJocb;

/*
let mappedRes = [];
let parsedData = [];

var parser = new xml2js.Parser();

fs.readFile(__dirname + '/jocb.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        parsedData = result.urlset.url;
    });
    console.log('data parsed ');
    // console.log('one: ' + JSON.stringify(parsedData[0].loc[0]))
    parsedData.forEach((item) =>{
        if (item['image:image']) {
            // console.log('image yay!')
            mappedRes.push({
                title: '',
                url: item.loc[0],
                lastmod: item.lastmod[0],
                image: item['image:image'][0]['image:loc'][0]
            })
        } else {
            // console.log('image no!')
            mappedRes.push({ 
                title: '', 
                url: item.loc[0], 
                lastmod: item.lastmod[0]
            })
        }
        
    })
    // console.log(mappedRes, null, 2)
    Recipe.insertMany(mappedRes, function (err, recipe) {
        if (err) {
          console.log(err);
        };
        // console.log(recipe);
    });
})

*/