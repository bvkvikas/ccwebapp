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
        cusine,
        servings,
        ingredients,
        steps,
        nutrition_information
    } = request.body;

    if (cook_time_in_min != null &&
        prep_time_in_min != null &&
        title != null &&
        cusine != null &&
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

            function(user) {
                const user_id = user.id;
                database.query(
                    'INSERT INTO RECIPE (recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients) \
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [uuidv4(), new Date(), new Date(), user_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients_json],
                    (err, recipeResult) => {
                        if (err) {
                            return response.status(400).json({
                                info: 'error while inserting recipe'
                            });
                        } else {
                            database.query(
                                'INSERT INTO NUTRITION(recipe_id, calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams) \
                                    VALUES($1, $2, $3, $4, $5, $6) RETURNING calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams ', [recipeResult.rows[0].recipe_id, nutrition_information.calories, nutrition_information.cholesterol_in_mg, nutrition_information.sodium_in_mg, nutrition_information.carbohydrates_in_grams, nutrition_information.protein_in_grams],
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
                                        console.log(values);
                                        let query = format('INSERT INTO ORDEREDLIST (id, recipe_id, step_number, instruction) VALUES %L returning step_number, instruction', values);

                                        console.log(query);

                                        database.query(query, (err, OrderedResult) => {
                                            if (err) {
                                                console.log(err);
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
            },
            function(err) {
                response.status(401).send(err);
            });

    } else {
        return response.status(422).json({
            info: 'Please enter all details'
        });
    }
}

const updateRecipe = (request, response) => {
    var id = request.params.id;

    const {
        cook_time_in_min,
        prep_time_in_min,
        title,
        cusine,
        servings,
        ingredients,
        steps,
        nutrition_information
    } = request.body;

    if (cook_time_in_min != null &&
        prep_time_in_min != null &&
        title != null &&
        cusine != null &&
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
            function(user) {
                const user_id = user.id;
                database.query("SELECT * FROM RECIPE WHERE recipe_id = $1 AND author_id = $2;", [id, user_id], function(err, recipeResult){
                    if(err) {
                        console.log(err);
                        return response.status(500).json({
                            info: 'Couldn\'t read from db'
                        });
                    } else {
                        if (recipeResult.rows.length > 0){
                            console.log("successfully read Recipe from db");
                            var recipe = recipeResult.rows[0];
                            // Update starts
                            // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                            database.query(
                                'UPDATE RECIPE SET updated_ts = $1, cook_time_in_min = $2, prep_time_in_min=$3, total_time_in_min=$4, title=$5, cusine=$6, servings=$7, ingredients=$8 \
                              WHERE recipe_id = $9', [new Date(), cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients_json, recipe.recipe_id],
                                (err, recipeResult) => {
                                    if (err) {
                                        return response.status(400).json({
                                            info: 'error while inserting recipe'
                                        });
                                    } else {
                                        database.query(
                                            'UPDATE NUTRITION SET calories=$1, cholesterol_in_mg=$2, sodium_in_mg=$3, carbohydrates_in_grams=$4, protein_in_grams=$5 \
                                            WHERE recipe_id=$6', [nutrition_information.calories, nutrition_information.cholesterol_in_mg, nutrition_information.sodium_in_mg, nutrition_information.carbohydrates_in_grams, nutrition_information.protein_in_grams, recipe.recipe_id],
                                            (err, nutritionResult) => {
                                                if (err) {
                                                    return response.status(400).json({
                                                        info: 'Error while updating nutrition details'
                                                    });
                                                } else {

                                                    var q = "UPDATE ORDEREDLIST AS OLDLIST SET \
                                                            step_number = NEWLIST.step_number, \
                                                            instruction = NEWLIST.instruction \
                                                        FROM (VALUES";
                                                    for (var i in steps) {
                                                        q += "('" + recipe.recipe_id + steps[i].position +"'," +steps[i].position+ ",'"+steps[i].instruction+"'),";
                                                    }
                                                    q = q.substring(0, q.length - 1); // Remove the last comma from the list
                                                    q += ") AS NEWLIST(id, step_number, instruction) where NEWLIST.id=OLDLIST.id and OLDLIST.recipe_id = '" + recipe.recipe_id + "'";

                                                    // console.log(q);

                                                    database.query(q, (err, OrderedResult) => {
                                                        if (err) {
                                                            console.log(err);
                                                            return response.status(400).json({
                                                                info: 'Error while updating recipe steps details'
                                                            });
                                                        } else {
                                                            return response.status(200).json({
                                                                info: 'successfully updated the recipe'
                                                            });
                                                        }
                                                    });

                                                }

                                            });
                                    }
                                });
                            // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                            // Update ends
                        } else {
                            return response.status(403).json({
                                info: 'Either the recipe does not exist or you don\'t have permissions to update it.'
                            });
                        }
                    }
                });
            },
            function(err) {
                response.status(401).send(err);
            }
        );

    } else {
        return response.status(422).json({
            info: 'Please enter all details'
        });
    }
}


const getRecipe = (request, response) => {
    var id = request.params.id;
    database.query(
        'SELECT recipe_id, created_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients from RECIPE \
        where recipe_id = $1', [id],
        function(err, result) {
            if (err) {
                return response.status(500).send({
                    error: 'Error getting recipe'
                });
            } else {
                return response.status(200).json(result.rows[0]);
            }
    });
}

module.exports = {
    createRecipe,
    updateRecipe,
    getRecipe
}