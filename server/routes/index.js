const express = require('express');
const app = express();


app.use( require('./user') );
app.use( require('./address/address') );
app.use( require('./address/sector') );
app.use( require('./address/village') );
app.use( require('./address/street') );
app.use( require('./login') );
app.use( require('./cylinder') );
app.use( require('./client') );





















module.exports = app;