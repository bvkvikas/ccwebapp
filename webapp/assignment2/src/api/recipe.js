const bcrypt = require('bcryptjs');
const Validator = require('../service/validator');
const db = require('../db');
const validator = new Validator();
const uuidv1 = require('uuid/v1');
const database = db.connection;

import {
    authPromise
} from './api';


//TODO: WRITE CRUD APIs, 