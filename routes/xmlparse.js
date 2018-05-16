var fs = require('fs'), xml2js = require('xml2js');
const {mongoose} = require('mongoose');
const {Site} = require('../models/site');
 
let mappedRes;

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/simply.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        //console.dir(JSON.stringify(result));
        // console.log(JSON.stringify(result.urlset));
        mappedRes = result.urlset.url.map((item) => {
            return {
                url: item.loc[0],
                lastmod: item.lastmod[0]
            }
        })
    });
    // console.log('mapped: ' + JSON.stringify(mappedRes, null, 2));
    console.log('saving parsed data');
    saveMe(mappedRes);
});



const saveMe = (content) => {
    let site = new Site({
        title: 'Simply Recipes',
        pagesIndexed: content.length,
        content: content
    })
    site.save().then((doc) => {
        console.log(doc)
        console.log('Saving done');
    }, (e) => {
        console.log(e)
    })
}

/*
    name: 'Simply Recipes',
    url: 'https://www.simplyrecipes.com/',
    indexDate: new Date(),
    content: {}
*/

/*
    let mappedRes;

    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/simply.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            //console.dir(JSON.stringify(result));
            // console.log(JSON.stringify(result.urlset));
            mappedRes = result.urlset.url.map((item) => {
                return {
                    pageurl: item.loc[0],
                    lastmod: item.lastmod[0],
                    image: item['image:image'][0]['image:loc'][0]
                }
            })
        });
        // console.log('mapped: ' + JSON.stringify(mappedRes, null, 2));
        console.log('saving parsed data');
        //saveMe(mappedRes);
    });
*/