const db = require('../db');
const uuidv4 = require('uuid/v4');
const database = db.connection;
const format = require('pg-format');
const api = require('./api');


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
        api.authPromise(request).then(

            function (user) {
                const user_id = user.id;

                database.query(
                    'INSERT INTO RECIPE (recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients) \
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [uuidv4(), new Date(), new Date(), user_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients_json],
                    (err, recipeResult) => {
                        if (err) {

                            return response.status(400).json({
                                info: err
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

                                        let query = format('INSERT INTO ORDEREDLIST (id, recipe_id, position, instruction) VALUES %L returning position, instruction', values);
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
            function (err) {
                response.status(401).send(err);
            });
    } else {
        return response.status(422).json({
            info: 'Please enter all details'
        });

    }
}

const deleteRecipe = (request, response) => {
    let id = request.params.id;

    if (id != null) {

        api.authPromise(request).then(
            function (user) {
                const user_id = user.id;

                database.query(`Select * from RECIPE where recipe_id = $1`, [id], function (err, result) {
                    if (err) {
                        return response.status(404).json({
                            info: 'sql error'
                        })
                    } else {
                        if (result.rows.length > 0) {
                            if (user_id === result.rows[0].author_id) {
                                if (result.rows[0] != null) {
                                    console.log("Result " + result.rows[0]);
                                    database.query('DELETE FROM ORDEREDLIST WHERE recipe_id = $1 ', [id]),
                                        database.query('DELETE FROM NUTRITION WHERE recipe_id = $1 ', [id]),
                                        database.query('DELETE FROM RECIPE WHERE recipe_id = $1 ', [id], function (err, result) {
                                            if (err) {
                                                return response.status(404).json({
                                                    info: 'sql error'
                                                })
                                            } else {

                                                return response.status(204).json({
                                                    message: "Deleted"
                                                });
                                            }
                                        })
                                } else {
                                    return response.status(404).json({
                                        message: "No Recipe Exisit for entered ID"
                                    });
                                }
                            } else {
                                return response.status(404).json({
                                    message: "you are not authorized to delete this recipe"
                                });
                            }

                        } else {
                            return response.status(404).json({
                                message: "Recipe with id not found"
                            });
                        }
                    }
                })
            },
            function (err) {
                response.status(401).send(err);
            });
    } else {
        response.status(404).json({
            message: 'Missing Parameters. Bad Request'
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

        api.authPromise(request).then(
            function (user) {
                const user_id = user.id;
                database.query("BEGIN", function (err, result) {
                    database.query("SELECT * FROM RECIPE WHERE recipe_id = $1 AND author_id = $2;", [id, user_id], function (err, recipeResult) {
                        if (err) {
                            console.log(err);
                            database.query('ROLLBACK', function (err, result) {
                                return response.status(500).json({
                                    info: 'Couldn\'t read from db'
                                });
                            });
                        } else {
                            if (recipeResult.rows.length > 0) {
                                var recipe = recipeResult.rows[0];
                                // Update starts
                                // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                                database.query(
                                    'UPDATE RECIPE SET updated_ts = $1, cook_time_in_min = $2, prep_time_in_min=$3, total_time_in_min=$4, title=$5, cusine=$6, servings=$7, ingredients=$8 \
                                      WHERE recipe_id = $9', [new Date(), cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients_json, recipe.recipe_id],
                                    (err, recipeResult) => {
                                        if (err) {
                                            console.log(err);
                                            console.log("Rolling back");
                                            database.query('ROLLBACK', function (err, result) {
                                                return response.status(400).json({
                                                    info: 'error while inserting recipe'
                                                });
                                            });
                                        } else {

                                            database.query(
                                                'UPDATE NUTRITION SET calories=$1, cholesterol_in_mg=$2, sodium_in_mg=$3, carbohydrates_in_grams=$4, protein_in_grams=$5 \
                                                WHERE recipe_id = $6', [nutrition_information.calories, nutrition_information.cholesterol_in_mg, nutrition_information.sodium_in_mg, nutrition_information.carbohydrates_in_grams, nutrition_information.protein_in_grams, recipe.recipe_id],
                                                (err, nutritionResult) => {
                                                    if (err) {
                                                        database.query('ROLLBACK', function (err, result) {
                                                            return response.status(500).json({
                                                                info: 'Couldn\'t read from db'
                                                            });
                                                        });
                                                    } else {
                                                        database.query('DELETE FROM ORDEREDLIST WHERE recipe_id = $1', [recipe.recipe_id], function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                console.log("Rolling back");
                                                                database.query('ROLLBACK', function (err, result) {
                                                                    return response.status(500).json({
                                                                        info: 'Couldn\'t delete from db'
                                                                    });
                                                                });
                                                            } else {
                                                                const values = [];
                                                                for (var i in steps) {
                                                                    values.push([
                                                                        recipe.recipe_id + steps[i].position,
                                                                        recipe.recipe_id,
                                                                        steps[i].position,
                                                                        steps[i].instruction
                                                                    ]);
                                                                }
                                                                let query = format('INSERT INTO ORDEREDLIST (id, recipe_id, position, instruction) VALUES %L returning position, instruction', values);
                                                                database.query(query, (err, OrderedResult) => {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        console.log("Rolling back");
                                                                        database.query('ROLLBACK', function (err, result) {
                                                                            return response.status(500).json({
                                                                                info: 'Couldn\'t read from db'
                                                                            });
                                                                        });
                                                                    } else {

                                                                        database.query('COMMIT', function (err, result) {

                                                                            getRecipe(request, response);
                                                                            return response.status(200);
                                                                        });
                                                                    }
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
                });
            },
            function (err) {
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
    if (id != null) {
        database.query(
            'SELECT recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients from RECIPE \
        where recipe_id = $1', [id],
            function (err, recipeResult) {
                if (err) {
                    return response.status(500).send({
                        error: 'Error getting recipe'
                    });
                } else {
                    if (recipeResult.rows.length > 0) {
                        recipeResult.rows[0].ingredients = JSON.parse(recipeResult.rows[0].ingredients);
                        database.query("select position, instruction from orderedlist where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultSteps) {
                            if (err) {
                                return response.status(500).send({
                                    error: 'Error getting recipe'
                                });
                            } else {
                                database.query("select calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams from nutrition where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultNutrition) {
                                    if (err) {
                                        return response.status(500).send({
                                            error: 'Error getting recipe'
                                        });
                                    } else {
                                        database.query("select id,url from images where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, imageResult) {
                                            if (err) {
                                                return response.status(500).send({
                                                    error: 'Error getting images data'
                                                });
                                            }
                                            return response.status(200).json({
                                                image: imageResult.rows[0],
                                                info: recipeResult.rows[0],
                                                steps: resultSteps.rows,
                                                nutrition_information: resultNutrition.rows[0]
                                            });
                                        })

                                    }
                                });
                            }
                        });
                    } else {
                        return response.status(404).send({
                            error: 'Recipe does not exist!'
                        });
                    }
                }
            });
    } else {
        return response.status(404).send({
            error: 'Please enter the recipe id'
        });
    }
}

const getNewRecipe = (request, response) => {
    database.query(
        'SELECT recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients from RECIPE \
       ORDER BY created_ts DESC LIMIT 1',
        function (err, recipeResult) {
            if (err) {
                return response.status(500).send({
                    error: 'Error getting recipe'
                });
            } else {
                if (recipeResult.rows.length > 0) {
                    recipeResult.rows[0].ingredients = JSON.parse(recipeResult.rows[0].ingredients);
                    database.query("select position, instruction from orderedlist where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultSteps) {
                        if (err) {
                            return response.status(500).send({
                                error: 'Error getting recipe'
                            });
                        } else {
                            database.query("select calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams from nutrition where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultNutrition) {
                                if (err) {
                                    return response.status(500).send({
                                        error: 'Error getting recipe'
                                    });
                                } else {
                                    return response.status(200).json({
                                        info: recipeResult.rows[0],
                                        steps: resultSteps.rows,
                                        nutrition_information: resultNutrition.rows[0]
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return response.status(404).send({
                        error: 'Recipe does not exist!'
                    });
                }
            }
        });
}


module.exports = {
    createRecipe,
    deleteRecipe,
    updateRecipe,
    getRecipe,
    getNewRecipe
}