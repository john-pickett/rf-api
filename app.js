const express = require('express');
const parser = require('./routes/parser.js');


const app = express();
const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Started up at ${port}`)
})

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH");
    next();
  });

app.get('/', (req, res) => {
    console.log('/ hit');
    res.send(parser)

})