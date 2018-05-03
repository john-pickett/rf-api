const express = require('express');
const parser = require('./routes/parser.js');


const app = express();
const port = process.env.port || 3001;

app.listen(port, () => {
    console.log(`Started up at ${port}`)
})

app.get('/', (req, res) => {
    console.log('/ hit');
    res.send(parser)

})