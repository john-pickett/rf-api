const Crawler = require('simplecrawler');
const cheerio = require('cheerio');
const {mongoose} = require('mongoose');

const {TestRecipe} = require('../../models/testrecipe');
const { Site } = require('../../models/site');

const crawl = (website) => {
    const crawlStart = new Date();
    console.log('crawling started for ' + website.url);
    return new Promise((resolve, reject) => {
        // URL to crawl and find website ObjectID for saving
        // const url = "https://www.macheesmo.com/";
        let websiteID;
        Site.findOne({ url: website.url }).then((doc) => {
            if (doc) {
                console.log('website found ' + doc.title + " " + doc._id);
                websiteID = doc._id;
            } else {
                let currentSite = new Site({
                    title: website.title,
                    url: website.url
                })
                currentSite.save().then((doc) => {
                    console.log('website saved ' + doc.title + " " + doc._id);
                    websiteID = doc._id;
                })
            }
            
        });

        // instantiate crawler
        var crawler = new Crawler(website.url);
        totalRecipesFound = 0;

        // stats for the current crawl session
        const printStats = () => {
            console.log("** Stats ** ");
            console.log('Currently crawling: ' + website.url);
            crawler.queue.countItems({ fetched: true }, function(error, count) {
                console.log('    Completed items: %d', count);
            });
            console.log('    Items in queue: ' + crawler.queue.length);
            const timeElapsed = new Date().getTime() - crawlStart.getTime();
            console.log('    Minutes elapsed: ' + Math.floor(timeElapsed / 60000));
            console.log('    Total Recipes Found: ' + totalRecipesFound);
            console.log("**  ** ");
        }

        let logStats = setInterval(() => {
            printStats();
            
        // }, 1200000); // 20 minutes
        }, 300000); // 5 minutes

        crawler.downloadUnsupported = false;
        crawler.decodeResponses = true;
        crawler.interval = 750;
        

        crawler.addFetchCondition((queueItem) => {
            return !queueItem.path.match(/\.(zip|jpe?g|png|mp4|gif|css|pdf|xml|doc?x|js|ico)$/i);
        });

        crawler.on("crawlstart", function() {
            console.log("crawling " + website.url + " started at: " + crawlStart);
        });

        crawler.on('queueadd', (queueItem, referrerQueueItem) => {
            // console.log('added: ' + JSON.stringify(queueItem, null, 2));
        });

        crawler.on("fetchcomplete", function(item, buffer, response) {
            let $ = cheerio.load(buffer.toString("utf8"));
                // creating object of HTML recipe data

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
                                            website: websiteID,
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
                                        
                                        // only save new recipes 
                                        TestRecipe.findOne( {url: currentRecipe.url }).then((doc) => {
                                            if (doc) {
                                                console.log(currentRecipe.name + ' is duplicate - not saved');
                                                return;
                                            } else {
                                                currentRecipe.save().then((doc) => {
                                                    console.log(doc.name + ' recipe saved!')
                                                }, (e) => {
                                                    console.error(e);
                                                })
                                            }
                                            
                                        })
                                        
                                    }
                                }
                            }
                        }
                    }
                }
        });

        crawler.on("complete", function() {
            console.log("crawling completed at: " + new Date());
            crawler.stop();
            clearInterval(logStats);
            resolve();
        });

        crawler.start();

        setTimeout(() => {
            console.log('Crawling stopped at timer');
            console.log("** Stats ** ");
            console.log('Currently crawling: ' + website.url);
            crawler.queue.countItems({ fetched: true }, function(error, count) {
                console.log('    Completed items: %d', count);
            });
            console.log('    Items in queue: ' + crawler.queue.length);
            const timeElapsed = new Date().getTime() - crawlStart.getTime();
            console.log('    Minutes elapsed: ' + Math.floor(timeElapsed / 60000));
            console.log('    Total Recipes Found: ' + totalRecipesFound);
            console.log("**  ** ");
            crawler.stop();
            clearInterval(logStats);
            resolve();
        // }, 60000) // 1 minute
        }, 14400000) // 4 hours
    })
    
}

const methods = {
    crawler: (website) => {
        return new Promise((resolve, reject) => {
            crawl(website).then(() => {
                resolve();
            })
        })
    }
}


module.exports = {methods};

/*
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
*/