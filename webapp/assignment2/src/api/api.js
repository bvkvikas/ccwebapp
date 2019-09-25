const bcrypt = require('bcryptjs');
const Validator = require('../service/validator');
const db = require('../db');
const validator = new Validator();
const uuidv1 = require('uuid/v1');
const database = db.connection;

var authPromise = function (req) {
    return new Promise(function (resolve, reject) {
        let auth = req.headers['authorization'];
        if (!auth) {
            reject({
                "message": "Please login"
            });
        } else if (auth) {
            let tmp = auth.split(' ');
            let plain_auth = Buffer.from(tmp[1], 'base64').toString();
            let creds = plain_auth.split(':');
            let username = creds[0];

            let password = creds[1];

            if (username != "" && password != "") {
                database.query(
                    `SELECT * from appusers where emailaddress = $1`, [username],
                    function (err, result) {
                        if (err) {
                            reject({
                                error: 'Error getting user account'
                            });
                        } else {
                            console.log("Result " + JSON.stringify(result.rows));
                            console.log(result.rows[0])
                            if (result.rows[0] == null) {
                                reject({
                                    message: 'Unauthorized : Invalid emailaddress'
                                })
                            } else {
                                if (bcrypt.compareSync(password, result.rows[0].password)) {
                                    console.log("Auth success!!");
                                    resolve(result.rows[0]);
                                } else {
                                    reject({
                                        message: 'Unauthorized : Invalid Password'
                                    });
                                }
                            };
                        }
                    });
            } else {
                res.status(400).json({
                    message: "Please enter all details"
                })
            }
        }
    });
}


const createUser = (request, response) => {
    const {
        emailaddress,
        password,
        firstname,
        lastname
    } = request.body;

    bcrypt.hash(password, 10, function (err, hash) {
        if (emailaddress != null && password != null) {
            if (validator.validateEmail(emailaddress)) {
                if (validator.validatePassword(password)) {
                    database.query(
                        'INSERT INTO APPUSERS (id, emailaddress, password, firstname, lastname, account_created, account_updated) \
                  VALUES ($1, $2, $3, $4, $5, $6, $7)', [uuidv1(), emailaddress, hash, firstname, lastname, new Date(), new Date()],
                        function (err, result) {
                            if (err) {

                                return response.status(400).json({
                                    info: 'username already exists'
                                });
                            } else {
                                return response.status(201).json({
                                    info: 'In successfully'
                                });
                            }
                        });
                } else {
                    return response.status(400).json({
                        info: 'Password is not strong enough'
                    })
                }
            } else {
                return response.status(400).json({
                    info: 'Invalid email address'
                })
            }

        } else {
            return response.status(422).json({
                info: 'Please enter all details'
            })
        }
    });


}

const updateUser = (request, response) => {
    authPromise(request).then(
        function (user) {
            let emailaddress = user["emailaddress"];
            const {
                firstname,
                lastname,
                password
            } = request.body;
            let update_firstname = firstname || user["firstname"];
            let update_lastname = lastname || user["lastname"];
            if (password != null && password != "") {
                // if(validator.validatePassword(password)){
                console.log("Updating user with password");
                bcrypt.hash(password, 10, function (err, hash) {
                    database.query("UPDATE APPUSERS SET firstname=$1, lastname=$2, password=$3, account_updated=$4 \
                where emailaddress = $5",
                        [update_firstname, update_lastname, hash, new Date(), emailaddress],
                        function (err, result) {
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
                // }

            } else {
                console.log("Updating user without password");
                database.query("UPDATE APPUSERS SET firstname=$1, lastname=$2, account_updated=$3 \
        where emailaddress = $4",
                    [update_firstname, update_lastname, new Date(), emailaddress],
                    function (err, result) {
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
        },
        function (err) {
            response.status(401).send(err);
        }
    );
}

const getUser = (request, response) => {
    authPromise(request).then(
        function (user) {
            const {
                emailaddress
            } = request.body;

            database.query(
                'SELECT id, emailaddress, firstname, lastname, account_created, account_updated from APPUSERS \
                  where emailaddress = $1', [emailaddress],
                function (err, result) {
                    if (err) {
                        return response.status(500).send({
                            error: 'Error getting user account'
                        });
                    } else {
                        return response.status(200).json(result.rows[0]);
                    }
                });

        },
        function (err) {
            response.status(401).send(err);
        }
    );
}

module.exports = {
    createUser,
    getUser,
    updateUser
}