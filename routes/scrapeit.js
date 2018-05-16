const scrapeIt = require("scrape-it");

scrapeIt('https://thesouthernladycooks.com/', {
    title: 'title',

}).then(({ data, response }) => {
    console.log(`Status Code: ${response.statusCode}`)
    console.log(data)
})
