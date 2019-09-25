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

client.connect(function(err) {
    if (err) {
        return console.error('Could not connect to Postgres', err);
    }
    const query = client.query(
        'CREATE TABLE IF NOT EXISTS APPUSERS( \
     emailaddress VARCHAR(100) UNIQUE NOT NULL, \
     firstname VARCHAR(40) not null, \
     lastname VARCHAR(40), \
     password VARCHAR(65) NOT NULL, \
     account_created timestamp NOT NULL, \
     account_updated timestamp NOT NULL \
     );',
        function(err, result) {
            if (err) {
                return console.error('Error running create table query', err);
            } else {
                console.log("Successfully created the table.");
            }
        });
});

module.exports = {
    connection: client
};