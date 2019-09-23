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
})
app.get('/', (request, response) => {
 console.log(request);
 response.json({ info: 'Node.js, Express, and Postgres API' });
})
//app.get('/test_users', db.getUsers)
//app.get('/test_users/:id', db.getUserById)
app.post('/create', api.createUser);
//app.put('/test_users/:id', db.updateUser)
//app.delete('/test_users/:id', db.deleteUser)
