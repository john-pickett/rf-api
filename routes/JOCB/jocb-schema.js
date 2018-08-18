const Crawler = require('simplecrawler');
const cheerio = require('cheerio');
const {mongoose} = require('mongoose');

const {TestRecipe} = require('../../models/testrecipe');

/*
const grabRecipeData = (url) => {

    const crawler = new Crawler(url);
    crawler.start();

    crawler.on('fetchcomplete', (item, buffer, response) => {
        let $ = cheerio.load(buffer.toString("utf8"));
        // creating object of HTML data
        let title = $('h1.entry-title').text();
        console.log(title);
        var obj = $("script[type='application/ld+json']"); 
        
        for(var i in obj){
            for(var j in obj[i].children){
                var data = obj[i].children[j].data;
                if(data){
                    data = JSON.parse(data);
                    if(data.hasOwnProperty("@type")) {
                        if (data["@type"] === "Recipe") {
                            console.log(data)
                        }
                    }
                }
            }
        }
        
        // crawler.stop();
    })
}
*/

// crawl('https://www.justonecookbook.com/chinese-style-karaage-don/');

let masterRecipes = [];

const crawl = () => {
    const crawlStart = new Date();
    return new Promise((resolve, reject) => {
        var crawler = new Crawler("https://www.justonecookbook.com");

        setInterval(() => {
            console.log("** Stats ** ");
            crawler.queue.countItems({ fetched: true }, function(error, count) {
                console.log("Completed items: %d", count);
            });
            console.log('Items in queue: ' + crawler.queue.length);
        }, 60000);

        crawler.downloadUnsupported = false;
        crawler.decodeResponses = true;
        crawler.interval = 1000;

        crawler.addFetchCondition(function(queueItem) {
            return !queueItem.path.match(/\.(zip|jpe?g|png|mp4|gif|css|pdf|xml)$/i);
        });

        crawler.on("crawlstart", function() {
            console.log("crawling started at: " + crawlStart);
        });

        crawler.on("fetchcomplete", function(item, buffer, response) {
            // console.log("fetchcomplete", item.url);
                let $ = cheerio.load(buffer.toString("utf8"));
                // creating object of HTML data
                let title = $('h1.entry-title').text();
                // console.log(title);
                var obj = $("script[type='application/ld+json']"); 
                // console.log('obj ' + obj)
                if (obj.length) {
                    for(var i in obj){
                        for(var j in obj[i].children){
                            var data = obj[i].children[j].data;
                            if(data && data !== "!DOCTYPE html"){

                            try {
                                data = JSON.parse(data);
                            } catch(e) {
                                console.log("parse error: " + e);
                            }
                                
                                if(data.hasOwnProperty("@type")) {
                                    if (data["@type"] === "Recipe") {
                                        // data = recipe data
                                        // console.log(data)
                                        let currentRecipe = {};

                                        currentRecipe = {
                                            name: data.name,
                                            url: item.url,
                                            author: data.author.name,
                                            datePublished: data.datePublished,
                                            description: data.description,
                                            image: data.image,
                                            recipeYield: data.recipeYield,
                                            prepTime: data.prepTime,
                                            cookTime: data.cookTime,
                                            totalTime: data.totalTime,
                                            recipeIngredient: data.recipeIngredient,
                                            recipeInstructions: data.recipeInstructions,
                                            recipeCategory: data.recipeCategory,
                                            recipeCuisine: data.recipeCuisine
                                        }
                                        // currentRecipe.push({name: data.name});
                                        // currentRecipe.push({author: data.author.name});
                                        // currentRecipe.push({datePublished: data.datePublished});
                                        // currentRecipe.push({image: data.image});
                                        // currentRecipe.push({recipeYield: data.recipeYield});
                                        // currentRecipe.push({prepTime: data.prepTime});
                                        // currentRecipe.push({cookTime: data.cookTime});
                                        // currentRecipe.push({totalTime: data.totalTime});
                                        // currentRecipe.push({recipeIngredient: data.recipeIngredient});
                                        // currentRecipe.push({recipeInstructions: data.recipeInstructions});
                                        // currentRecipe.push({recipeCategory: data.recipeCategory});
                                        // console.log(JSON.stringify(currentRecipe));

                                        masterRecipes.push(currentRecipe);
                                        console.log('Current recipe count: ' + masterRecipes.length);
                                        
                                        if (masterRecipes.length >= 5) {
                                            // console.log(JSON.stringify(masterRecipes))
                                            let crawlPause = new Date();
                                            console.log('crawling paused at ' + crawlPause);
                                            const timeElapsed = crawlPause.getTime() - crawlStart.getTime();
                                            // console.log('time elapsed ' + timeElapsed);
                                            console.log('Minutes elapsed: ' + Math.floor(timeElapsed / 60000));

                                            crawler.queue.freeze("jocb-pause.json", function () {
                                                
                                                    TestRecipe.insertMany(masterRecipes).then(() => {
                                                        console.log("Recipes saved to db");
                                                        masterRecipes = [];
                                                    
                                                    }).catch((err) => {
                                                        console.log(err);
                                                    })
                                                    
                                                })
                                            
                                            // crawler.stop();
                                            // resolve();
                                        
                                        }
                                        
                                    }
                                }
                            }
                        }
                    }
                }
                
                
                // 
                
        });

        // crawler.on("fetch404", function(queueItem, response) {
        //     console.log("fetch404", queueItem.url, response.statusCode);
        // });

        // crawler.on("fetcherror", function(queueItem, response) {
        //     console.log("fetcherror", queueItem.url, response.statusCode);
        // });

        crawler.on("complete", function() {
            console.log("crawling completed at: " + new Date());
            crawler.stop();
            resolve();
        });

        crawler.start();
    })
    
}



const jocb = {
    schedule: () => {
        setInterval(() => {
            crawl().then(() => {
                TestRecipe.insertMany(masterRecipes, {ordered: false}, function (err, recipe) {
                    if (err) {
                        console.log(err);
                    };
                    console.log(recipe.name);
                })
            });
        }, 180000)
    },
    crawl2: () => {
        console.log('first')
        crawl().then(() => {
            // console.log('from then: ' + JSON.stringify(masterRecipes, null, 2))
            TestRecipe.insertMany(masterRecipes).then(() => {
                console.log("success??")
            }).catch((err) => {
                console.log(err);
            })
        }).catch((err) => {
            console.log(err)
        });
    },
    crawl: () => {
        crawl();
    }
} 

module.exports = {jocb};