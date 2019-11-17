const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const api = require('./src/api/api');
const recipe = require('./src/api/recipe');
const image = require('./src/api/image');
const dotenv = require('dotenv');
const logger = require('./config/winston');

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

//app.use(morganLogger('dev'));
app.post('/v1/user', api.createUser);
app.put('/v1/user/self', api.updateUser);
app.get('/v1/user/self', api.getUser);

app.post('/v1/recipe/', recipe.createRecipe);
app.delete('/v1/recipe/:id', recipe.deleteRecipe);
app.delete('/v1/recipe/', recipe.deleteRecipe);

app.put('/v1/recipe/:id', recipe.updateRecipe);
app.get('/v1/recipe/', recipe.getRecipe);
app.get('/v1/recipes/', recipe.getNewRecipe);
app.get('/v1/recipe/:id', recipe.getRecipe);
app.post('/v1/myrecipes', recipe.myrecipes);

app.get('/v1/recipe/:recipeId/image/:imageId', image.getImage);
app.post('/v1/recipe/:recipeId/image', image.uploadImage);
app.delete('/v1/recipe/:recipeId/image/:imageId', image.deleteImage);


// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   //const error = new Error('Not found');
//   // error.status(404);
//   //logger.error(error);
//   next(error);
// });


// app.use((error, req, res, next) => {
//   // res.status(error.status || 500);
//   console.log(error);
//   // logger.error(error.message);
//   res.json({
//     error: {
//       message: error.message
//     }

//   });
// });

module.exports = app;