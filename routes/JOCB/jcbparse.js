var fs = require('fs'), xml2js = require('xml2js');
const {mongoose} = require('mongoose');
const {Site} = require('../models/site');
const {Recipe} = require('../../models/recipe');
 
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



