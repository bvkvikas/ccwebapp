const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const {
    Client
} = require('pg');

dotenv.config();
const {
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
    DB_SCHEMA
} = process.env;
const connectionString = process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_SCHEMA}`;

const database = new Client(connectionString);
const db = require('../api/api');

let checkAccess = (req, res, next) => {
    let auth = req.headers['authorization'];
    
    if(!auth){
        res.status(401).json({"message": "Please login"});
    }else if(auth) {
        let tmp = auth.split(' ');
        let plain_auth = Buffer.from(tmp[1], 'base64').toString();
        let creds = plain_auth.split(':');
        let username = creds[0];

        let password = creds[1];
        
        if(username!=""&& password!="") {
            const data = db.validateUser(username);
            console.log(`my data :: ${data}`);
                if (data == null) {
                    return res.status(401).json({
                        message: 'Unauthorized : Invalid emailaddress'
                    })
                } else {
                    if (bcrypt.compareSync(password, data.password)) {
                        next();
                    } else {
                        return res.status(401).json({
                            message: 'Unauthorized : Invalid Password'
                        });
                    }
                
            };

        }else{
            res.status(400).json({
                message:"Please enter all details"
            })
        }
    }
}

module.exports = {
    checkAccess: checkAccess
};
