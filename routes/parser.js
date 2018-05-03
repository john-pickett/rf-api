let Parser = require('rss-parser');
let parser = new Parser();
 
let recipes = [];

(async () => {

    let feed = await parser.parseURL('https://therecipecritic.com/feed');
    console.log(feed.title);
    // console.log(JSON.stringify(feed, null, 2));
    feed.items.forEach(item => {
        recipes.push(item.title, item.link)
    });
 
})();

module.exports = recipes;