const bcrypt = require('bcryptjs');
const Validator = require('../service/validator');
const db = require('../db');
const validator = new Validator();

const database = db.connection;

const createUser = (request, response) => {
    const {
        emailaddress,
        password,
        firstname,
        lastname
    } = request.body;
    
    bcrypt.hash(password, 10, function(err, hash) {
        if(emailaddress != null && password != null){
            if(validator.validateEmail(emailaddress)){
                if(validator.validatePassword(password)){
                    database.query(
                        'INSERT INTO APPUSERS (emailaddress, password, firstname, lastname, account_created, account_updated) \
                  VALUES ($1, $2, $3, $4, $5, $6)', [emailaddress, hash, firstname, lastname, new Date(), new Date()],
                        function(err, result) {
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
                }else{
                    return response.status(400).json({
                        info: 'Password is not strong enough'
                    })
                }
            }else{
                return response.status(400).json({
                    info: 'Invalid email address'
                })
            }
            
            }else{
                return response.status(422).json({
                    info: 'Please enter all details'
                })
            }
        });
        
      
}

const getUser = (request, response) => {
    const {
        emailaddress
    } = request.body;
    console.log(emailaddress);
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

const validateUser = (emailaddress) => {
    let data = "";
    database.query(
        'SELECT * from APPUSERS \
      where emailaddress = $1', [emailaddress], (err,result) => {
        if (err) {
            return response.status(500).send({
                error: 'Error getting user account'
            });
        } else {
            return (result.rows[0]);
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
                    if(validator.validatePassword(password)){
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
                    }
                   
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
    updateUser,
    validateUser
}