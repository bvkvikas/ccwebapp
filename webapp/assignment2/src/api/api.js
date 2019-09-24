const {
    Client
} = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();
const {
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
    DB_SCHEMA
} = process.env;

const connectionString = process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_SCHEMA}`;
const database = new Client(connectionString);
database.connect(function(err) {
    if (err) {
        console.error('could not connect to postgres', err);
    } else {
        console.log("successfully connected to postgres");
    }
});

const createUser = (request, response) => {
    const {
        emailaddress,
        password,
        firstname,
        lastname
    } = request.body;
    bcrypt.hash(password, 10, function(err, hash) {
        database.query(
            'INSERT INTO APPUSERS (emailaddress, password, firstname, lastname, account_created, account_updated) \
      VALUES ($1, $2, $3, $4, $5, $6)', [emailaddress, hash, firstname, lastname, new Date(), new Date()],
            function(err, result) {
                if (err) {
                    return response.status(500).send({
                        error: 'Error creating user account'
                    });
                } else {
                    return response.status(200).json({
                        info: 'Inserted successfully'
                    });
                }
            });
    });
}

const getUser = (request, response) => {
    const {
        emailaddress
    } = request.body;
    database.query(
        'SELECT emailaddress, firstname, lastname, account_created, account_updated from APPUSERS \
      where emailaddress = $1', [emailaddress],
        function(err, result) {
            if (err) {
                return response.status(500).send({
                    error: 'Error getting user account'
                });
            } else {
                return response.status(200).json(result.rows[0]);
            }
        });
}

const updateUser = (request, response) => {
    const {
        emailaddress,
        firstname,
        lastname,
        password
    } = request.body;
    database.query(
        'SELECT emailaddress, firstname, lastname from APPUSERS \
      where emailaddress = $1', [emailaddress],
        function(err, result) {
            if (err) {
                return response.status(500).send({
                    error: 'Error getting user account'
                });
            } else {
                let user = result.rows[0];
                let update_firstname = firstname || user["firstname"];
                let update_lastname = lastname || user["lastname"];
                if (password != null && password != "") {
                    console.log("Updating user with password");
                    bcrypt.hash(password, 10, function(err, hash) {
                        database.query("UPDATE APPUSERS SET firstname=$1, lastname=$2, password=$3, account_updated=$4 \
                where emailaddress = $5",
                            [update_firstname, update_lastname, hash, new Date(), emailaddress],
                            function(err, result) {
                                if (err) {
                                    return response.status(500).send({
                                        error: 'Error updating user account'
                                    });
                                } else {
                                    console.info("successfully updated the user");
                                    return response.status(200).json({
                                        info: "success"
                                    })
                                }
                            });
                    });
                } else {
                    console.log("Updating user without password");
                    database.query("UPDATE APPUSERS SET firstname=$1, lastname=$2, account_updated=$3 \
            where emailaddress = $4",
                        [update_firstname, update_lastname, new Date(), emailaddress],
                        function(err, result) {
                            if (err) {
                                console.error("eror updating user", err);
                                return response.status(500).send({
                                    error: 'Error updating user account'
                                });
                            } else {
                                console.info("successfully updated the user");
                                return response.status(200).json({
                                    info: "success"
                                })
                            }
                        });
                }
            }
        });
}

module.exports = {
    createUser,
    getUser,
    updateUser
}
