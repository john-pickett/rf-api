var fs = require('fs'), xml2js = require('xml2js');
const {mongoose} = require('mongoose');
const {Recipe} = require('../../models/recipe');
const Crawler = require('simplecrawler');
const cheerio = require('cheerio');

const crawl = (url) => {
    return new Promise((resolve, reject) => {
        var crawler = new Crawler(url);
        console.log('fetching ' + url)
        let recipeInfo = {};
        crawler.start();

        crawler.on("fetchcomplete", function(item, buffer, response) {
            console.log("I just received " + item.url);
            let $ = cheerio.load(buffer.toString("utf8"));
            recipeInfo.title = $('h1.entry-title').text();
            recipeInfo.image = $('div.featured-image').find('img').attr('src');
            recipeInfo.ingList = $("div.recipe-ingredients li").map(function() {
                return $(this).text();
                }).toArray();

            crawler.stop();
            resolve(recipeInfo);
        });
        Promise.all(recipeInfo)
    });
}
 
const parseMe = () => {
    let parsedData = [];
    let mappedRes = [];

    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/simply-sitemap.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            parsedData = result.urlset.url;

            parsedData.forEach((item) =>{
                if (item['image:image']) {
                    mappedRes.push({
                        title: '',
                        url: item.loc[0],
                        // lastmod: item.lastmod[0],
                        image: ''
                    })
                } else {
                    // console.log('image no!')
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
        
        async function getList(input) {
            for (const item of input) {
                let recipe = await crawl(item.url)
                // console.log('getList ings are ' + ingredients);
                // console.log('recipe ' + JSON.stringify(recipe));
                item.title = recipe.title;
                item.image = recipe.image;
                item.ingredients = recipe.ingList;
                // console.log('item ' + JSON.stringify(item, null, 2));
            }
            console.log('getList done')
        }

        getList(mappedRes).then(() => {
            Recipe.insertMany(mappedRes, function (err, recipe) {
                if (err) {
                  console.log(err);
                };
                console.log('recipe saved!');
            });
        })
        
        
    });
}


module.exports = parseMe;