const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

// importing routes
const appRoutes = require('./routes/app.routes');

// using npm middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded( {extended: true} ));
app.use(bodyParser.json());


app.use('/api', appRoutes);

// handling the ports
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`API running on port ${port}`);
});