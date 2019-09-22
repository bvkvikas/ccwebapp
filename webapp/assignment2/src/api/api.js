var express = require('express');
var  todos  = require('../db.js');
const router = express.Router();


router.get('/todos', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'Wohooo',
    todos: todos
  })
});

module.exports =  router;