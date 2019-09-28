const {
    Client
} = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const {
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
    DB_SCHEMA
} = process.env;
const connectionString = process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_SCHEMA}`;
const client = new Client(connectionString);

console.log("Creating the tables..");

client.connect(function (err) {
    if (err) {
        return console.error('Could not connect to Postgres', err);
    }
    client.query(
        'CREATE TABLE IF NOT EXISTS APPUSERS( \
     id VARCHAR(36) PRIMARY KEY, \
     emailaddress VARCHAR(100) UNIQUE NOT NULL, \
     firstname VARCHAR(40) not null, \
     lastname VARCHAR(40), \
     password VARCHAR(65) NOT NULL, \
     account_created timestamp NOT NULL, \
     account_updated timestamp NOT NULL \
     );',
        function (err, result) {
            if (err) {
                return console.error('Error running create table query', err);
            } else {
                console.log("Successfully created user table.");
            }
        });
});

client.query(
    'CREATE TABLE IF NOT EXISTS RECIPE( \
     recipe_id VARCHAR(36) PRIMARY KEY, \
     created_ts VARCHAR(100) UNIQUE NOT NULL, \
     author_id VARCHAR(36),\
     FOREIGN KEY(author_id) REFERENCES APPUSERS(id),\
     cook_time_in_min int NOT NULL, \
     prep_time_in_min int NOT NULL, \
     total_time_in_min int, \
     title VARCHAR(200) NOT NULL, \
     cuisine VARCHAR(100) NOT NULL, \
     servings int not null check(servings between 1 and 5),\
     ingredients VARCHAR(255) NOT NULL \
    );',


    function (err, result) {
        if (err) {
            return console.error('Error running create table query', err);
        } else {
            console.log("Successfully created recipe table.");
        }
    });

client.query(
    'CREATE TABLE IF NOT EXISTS NUTRITION( \
     id VARCHAR(36) PRIMARY KEY, \
     recipie_id VARCHAR(36),\
     FOREIGN KEY(recipie_id) REFERENCES RECIPE(recipe_id), \
     calories int NOT NULL,\
     cholesterol_in_mg FLOAT NOT NULL, \
     sodium_in_mg int NOT NULL,\
     carbohydrates_in_grams FLOAT NOT NULL, \
     protein_in_grams FLOAT NOT NULL\
    );',


    function (err, result) {
        if (err) {
            return console.error('Error running create table query', err);
        } else {
            console.log("Successfully created nutrition table.");
        }
    });
module.exports = {
    connection: client
};