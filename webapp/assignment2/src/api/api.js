var express = require('express');
import { Client } from 'pg';
const dotenv = require('dotenv');
dotenv.config();
const { DB_USER, DB_PASSWORD, DB_PORT,DB_SCHEMA } = process.env;
console.log(DB_USER);
const createUser = (request, response) => {
 const connectionString = process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_SCHEMA}`;
const client = new Client(connectionString);
 const { username, password, emailaddress, firstname, lastname } = request.body;
 client.connect(function(err) {
   if(err) {
     return console.error('could not connect to postgres', err);
   }
   client.query(
     'INSERT INTO APPUSERS (username, password, emailaddress, firstname, lastname) VALUES ($1, $2, $3, $4, $5)', [username, password, emailaddress, firstname, lastname], function(err, result) {
     if(err) {
       return console.error('error running query', err);
     }else{
       response.json({ info: 'Inserted successfully' });
     }
   });
  });
}
module.exports = {
 //getUsers,
 //getUserById,
 createUser,
 //updateUser,
 //deleteUser,
}
