const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const api = require('./src/api/api');
const dotenv = require('dotenv');
const db = require('./src/db');
const authorization = require('../assignment2/src/service/authorization');



dotenv.config();
const PORT = process.env.PORT;
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.listen(PORT, () => {
    console.log(`App running on PORT ${PORT}.`);
});

app.post('/v1/user', api.createUser);
app.put('/v1/user/self', api.updateUser);
app.get('/v1/user/self', api.getUser);

module.exports = app;