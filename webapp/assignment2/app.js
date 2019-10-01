const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const api = require('./src/api/api');
const recipe = require('./src/api/recipe');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT;
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.listen(PORT, () => {
    console.log(`App running on PORT ${PORT}.`);
});

app.post('/v1/user', api.createUser);
app.put('/v1/user/self', api.updateUser);
app.get('/v1/user/self', api.getUser);

app.post('/v1/recipe', recipe.createRecipe);
app.delete('/v1/recipe/:id', recipe.deleteRecipe);
app.put('/v1/recipe/:id', recipe.updateRecipe);
app.get('/v1/recipe/:id', recipe.getRecipe);


module.exports = app;