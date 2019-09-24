const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const api = require('./src/api/api');
const dotenv = require('dotenv');
const db = require('./src/db');
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
app.get('/', (request, response) => {
    console.log(request);
    response.json({
        info: 'Node.js, Express, and Postgres API'
    });
})
app.post('/user/create', api.createUser);
app.post('/user/get', api.getUser);
app.post('/user/update', api.updateUser);