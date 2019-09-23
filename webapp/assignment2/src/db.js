import { Client } from 'pg';
const dotenv = require('dotenv');
dotenv.config();
const { DB_USER, DB_PASSWORD, DB_PORT,DB_SCHEMA } = process.env;
const connectionString = process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_SCHEMA}`;
const client = new Client(connectionString);
console.log('in hereee'+client);
client.connect(function(err) {
if(err) {
  return console.error('could not connect to postgres', err);
}
const query = client.query(
     'CREATE TABLE IF NOT EXISTS APPUSERS( emailaddress VARCHAR(100) NOT NULL, firstname VARCHAR(40) not null, lastname VARCHAR(40),username VARCHAR(100), password VARCHAR(20) NOT NULL);', function(err, result) {
  if(err) {
    return console.error('error running query', err);
  }
});
});
