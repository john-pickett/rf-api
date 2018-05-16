const Crawler = require('simplecrawler');
const cheerio = require('cheerio');
const moment = require('moment');

const {mongoose} = require('mongoose');
const {Site} = require('./models/site');

var port = 80;
var exclude = ['gif', 'jpg', 'jpeg', 'png', 'ico', 'bmp', 'ogg', 'webp',
  'mp4', 'webm', 'mp3', 'ttf', 'woff', 'json', 'rss', 'atom', 'gz', 'zip',
  'rar', '7z', 'css', 'js', 'gzip', 'exe'];
var exts = exclude.join('|');
var regex = new RegExp('\.(' + exts + ')', 'i'); // This is used for filtering crawl items.
var crawler = new Crawler('https://www.justonecookbook.com/');

let pages = []; // This array will hold all the URLs
let startTime = moment();
console.log('start time: ' + startTime.format("dddd, MMMM Do YYYY, h:mm:ss a"));

// Crawler configuration
crawler.initialPort = port;
crawler.initalPath = '/recipes';

crawler.addFetchCondition(function (parsedURL) {
    return !parsedURL.path.match(regex); // This will reject anything that's not a link.
});

crawler.maxDepth = 2;

// Run the crawler
crawler.start();
console.log('crawler starting... ');

crawler.on('fetchcomplete', (item, buffer, response) => {
    // console.log(JSON.stringify(item, null, 2));
    let $ = cheerio.load(buffer.toString("utf8"));
    let title = $("title").text();
    pages.push({id: item.id, title: title, url: item.url});
    console.log('adding ' + item.url);
    console.log('pages indexed: ' + pages.length);
    
    
});

crawler.on('complete', () => {
    console.log('done!' + pages.length)
    let endTime = moment();
    console.log('end time: ' + endTime);
    let timeElapsed = startTime.diff(moment(), 'minutes');
    console.log('time elapsed: ' + timeElapsed);
    let site = new Site({
        title: 'One Cookbook',
        pagesIndexed: pages.length,
        content: pages
    });
    site.save().then((doc) => {
        console.log(doc)
    }, (e) => {
        console.log(e)
    })

});
