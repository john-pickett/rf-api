let Parser = require('rss-parser');
let parser = new Parser();

// http://feedproxy.google.com/elise/simplyrecipes
// https://thestayathomechef.com/feed
// https://thesouthernladycooks.com/feed
// https://therecipecritic.com/feed
 
let recipes = [];
// let feeds = ['http://feedproxy.google.com/elise/simplyrecipes', 'https://thestayathomechef.com/feed', 
//     'https://thesouthernladycooks.com/feed', 'https://therecipecritic.com/feed'];
    

(async () => {

    let feed = await parser.parseURL('http://feedproxy.google.com/elise/simplyrecipes');
    console.log(feed.title);
    // console.log(JSON.stringify(feed, null, 2));
    feed.items.forEach(item => {
        recipes.push({title: item.title, link: item.link})
    });
 
})();

(async () => {

    let feed = await parser.parseURL('https://thestayathomechef.com/feed');
    console.log(feed.title);
    // console.log(JSON.stringify(feed, null, 2));
    feed.items.forEach(item => {
        recipes.push({title: item.title, link: item.link})
    });
 
})();

(async () => {

    let feed = await parser.parseURL('https://thesouthernladycooks.com/feed');
    console.log(feed.title);
    // console.log(JSON.stringify(feed, null, 2));
    feed.items.forEach(item => {
        recipes.push({title: item.title, link: item.link})
    });
 
})();

(async () => {

    let feed = await parser.parseURL('https://therecipecritic.com/feed');
    console.log(feed.title);
    // console.log(JSON.stringify(feed, null, 2));
    feed.items.forEach(item => {
        recipes.push({title: item.title, link: item.link})
    });
 
})();

module.exports = recipes;