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
        const url = "https://www.justonecookbook.com"
        var crawler = new Crawler(url);
        totalRecipesFound = 0;

        const printStats = () => {
            console.log("** Stats ** ");
            crawler.queue.countItems({ fetched: true }, function(error, count) {
                console.log('    Completed items: %d', count);
            });
            console.log('    Items in queue: ' + crawler.queue.length);
            const timeElapsed = new Date().getTime() - crawlStart.getTime();
            console.log('    Minutes elapsed: ' + Math.floor(timeElapsed / 60000));
            console.log('    Total Recipes Found: ' + totalRecipesFound);
            console.log("**  ** ");
        }

        setInterval(() => {
            printStats();
            
        // }, 1200000); // 20 minutes
        }, 300000); // 5 minutes

        crawler.downloadUnsupported = false;
        crawler.decodeResponses = true;
        crawler.interval = 750;
        

        crawler.addFetchCondition((queueItem) => {
            return !queueItem.path.match(/\.(zip|jpe?g|png|mp4|gif|css|pdf|xml|doc?x|js|ico)$/i);
        });

        // crawler.addFetchCondition((parsedURL) => {
        //     if (parsedURL.path.match(/\.(css|jpe?g|pdf|docx|js|png|ico|zip|mp4|gif|xml)/i)) {
        //         // console.log("Not fetching " + parsedURL.path);
        //         return false;
        //     }
        
        //     return true;
        // });

        crawler.on("crawlstart", function() {
            console.log("crawling " + url + " started at: " + crawlStart);
        });

        crawler.on('queueadd', (queueItem, referrerQueueItem) => {
            // console.log('added: ' + JSON.stringify(queueItem, null, 2));
        });

        crawler.on("fetchcomplete", function(item, buffer, response) {
            // console.log('item', JSON.stringify(item, null, 2));
            // console.log('buffer', JSON.stringify(buffer, null, 2));
            // console.log('response', response);

               
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
                                        // let currentRecipe = {};

                                        let currentRecipe = new TestRecipe({
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
                                        })
                                        totalRecipesFound++;

                                        currentRecipe.save().then((doc) => {
                                            console.log(doc.name + ' recipe saved!')
                                        }, (e) => {
                                            console.error(e);
                                        })
                                        /*
                                        masterRecipes.push(currentRecipe);
                                        console.log('Current recipe count: ' + masterRecipes.length);
                                        
                                        if (masterRecipes.length >= 50) {
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
                                        */
                                    }
                                }
                            }
                        }
                    }
                }
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