const bcrypt = require('bcryptjs');
const Validator = require('../service/validator');
const db = require('../db');
const validator = new Validator();
const uuidv4 = require('uuid/v4');
const database = db.connection;
const format = require('pg-format');
// const {
//     Client
// } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();
// const {
//     DB_USER,
//     DB_PASSWORD,
//     DB_PORT,
//     DB_SCHEMA
// } = process.env;
// const connectionString = process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_SCHEMA}`;
// const db2 = pgp(connectionString);
import {
    authPromise
} from './api';


const createRecipe = (request, response) => {
    const {
        cook_time_in_min,
        prep_time_in_min,
        title,
        cuisine,
        servings,
        ingredients,
        steps,
        nutrition_information
    } = request.body;


    if (cook_time_in_min != null &&
        prep_time_in_min != null &&
        title != null &&
        cuisine != null &&
        servings != null &&
        ingredients != null &&
        steps != null &&
        nutrition_information != null) {

        if (!(cook_time_in_min % 5 === 0 && prep_time_in_min % 5 === 0)) {
            return response.status(450).json({
                info: 'Please enter cook time and prep time in multiples of 5'
            })
        }
        if (!(servings >= 1 && servings <= 5)) {
            return response.status(450).json({
                info: 'Servings should be between 1 and 5'
            })
        }

        const total_time_in_min = cook_time_in_min + prep_time_in_min;
        const ingredients_json = JSON.stringify(ingredients);
        authPromise(request).then(

            function (user) {
                const user_id = user.id;
                database.query(
                    'INSERT INTO RECIPE (recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cuisine, servings, ingredients) \
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
                    [uuidv4(), new Date(), new Date(), user_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cuisine, servings, ingredients_json],
                    (err, recipeResult) => {
                        if (err) {
                            return response.status(400).json({
                                info: 'error while inserting recipe'
                            });
                        } else {
                            database.query(
                                'INSERT INTO NUTRITION(recipe_id, calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams) \
                                    VALUES($1, $2, $3, $4, $5, $6) RETURNING calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams ',
                                [recipeResult.rows[0].recipe_id, nutrition_information.calories, nutrition_information.cholesterol_in_mg, nutrition_information.sodium_in_mg, nutrition_information.carbohydrates_in_grams, nutrition_information.protein_in_grams],
                                (err, nutritionResult) => {
                                    if (err) {
                                        database.query('DELETE FROM RECIPE WHERE recipe_id = $1 ', [recipeResult.rows[0].recipe_id]);
                                        return response.status(400).json({
                                            info: 'Error while uploading nutrition details'
                                        });
                                    } else {

                                        const values = [];
                                        for (var i in steps) {
                                            values.push([
                                                recipeResult.rows[0].recipe_id + steps[i].position,
                                                recipeResult.rows[0].recipe_id,
                                                steps[i].position,
                                                steps[i].instruction
                                            ]);
                                        }
                                        let query = format('INSERT INTO ORDEREDLIST (id, recipe_id, step_number, instruction) VALUES %L returning step_number, instruction', values);

                                        console.log(query);

                                        database.query(query, (err, OrderedResult) => {
                                            if (err) {
                                                database.query('DELETE FROM RECIPE WHERE recipe_id = $1 ', [recipeResult.rows[0].recipe_id]);
                                                database.query('DELETE FROM NUTRITION WHERE recipe_id = $1 ', [recipeResult.rows[0].recipe_id]);
                                                return response.status(400).json({
                                                    info: 'Error while uploading recipe steps details'
                                                });

                                            } else {
                                                return response.status(200).json({
                                                    info: recipeResult.rows[0],
                                                    steps: OrderedResult.rows,
                                                    nutrition_information: nutritionResult.rows[0]

                                                });
                                            }
                                        });

                                    }

                                });
                        }
                    });
            });

    } else {
        return response.status(422).json({
            info: 'Please enter all details'
        });
    }
}

module.exports = {
    createRecipe,

}