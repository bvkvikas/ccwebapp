var express = require('express');
const app = express();

var constants = require('./constants.js');

const apis = require('./src/api/api');
app.listen(constants.PORT, () => {
  console.log(`server running on port ${constants.PORT}`)
});

app.use("/apis",apis);