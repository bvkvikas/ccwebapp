const db = require('../db');
const uuidv4 = require('uuid/v4');
const database = db.connection;
const format = require('pg-format');
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const api = require('./api');
const logger = require('../../config/winston')
const SDC = require('statsd-client'),
    sdc = new SDC({
        host: 'localhost',
        port: 8125
    });

const {
    S3_BUCKET_NAME,
    DOMAIN_NAME
} = process.env;


// Create an S3 client
var s3 = new AWS.S3();
var sns = new AWS.SNS();

const createRecipe = (request, response) => {
    logger.info("create recipe call");
    sdc.increment('Create recipe');
    // sdc.timing('response_time', 42);
    let start = Date.now();
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
                            logger.error(err);
                            return response.status(400).json({
                                info: err
                            });
                        } else {
                            database.query(
                                'INSERT INTO NUTRITION(recipe_id, calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams) \
                                    VALUES($1, $2, $3, $4, $5, $6) RETURNING calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams ', [recipeResult.rows[0].recipe_id, nutrition_information.calories, nutrition_information.cholesterol_in_mg, nutrition_information.sodium_in_mg, nutrition_information.carbohydrates_in_grams, nutrition_information.protein_in_grams],
                                (err, nutritionResult) => {
                                    if (err) {
                                        logger.error(err);
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
                                                logger.error(err);
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
                logger.error(err);
                response.status(401).send(err);
            });
    } else {
        return response.status(422).json({
            info: 'Please enter all details'
        });

    }
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('Create recipe response time', elapsed);
}

const deleteRecipe = (request, response) => {
    logger.info("delete recipe call");
    sdc.increment('Delete recipe by id');
    let start = Date.now();
    let id = request.params.id;

    if (id != null) {

        api.authPromise(request).then(
            function (user) {
                const user_id = user.id;

                database.query(`Select * from RECIPE where recipe_id = $1`, [id], function (err, result) {
                    if (err) {
                        logger.error(err);
                        return response.status(404).json({
                            info: 'sql error'
                        })
                    } else {
                        if (result.rows.length > 0) {
                            if (user_id === result.rows[0].author_id) {
                                if (result.rows[0] != null) {
                                    console.log("Result " + result.rows[0]);
                                    database.query('select * from IMAGES where recipe_id = $1', [id], function (err, imgresult) {
                                        if (err) {
                                            logger.error(err);
                                            return response.status(404).json({
                                                info: 'sql error'
                                            })
                                        } else {
                                            if (imgresult.rows.length > 0) {
                                                imgresult.rows.forEach(function (img) {
                                                    const params = {
                                                        Bucket: S3_BUCKET_NAME,
                                                        Key: "images/" + img.id
                                                    };
                                                    s3.deleteObject(params, function (err, data) {
                                                        if (err) {
                                                            logger.error(err);
                                                            return response.status(500).send({
                                                                error: 'Error deleting the file from storage system'
                                                            });
                                                        }
                                                        console.log('File deleted successfully from S3 bucket.');
                                                        return response.status(204).end();
                                                    });

                                                });

                                            }
                                        }
                                    })
                                    database.query('DELETE FROM ORDEREDLIST WHERE recipe_id = $1 ', [id]),
                                        database.query('DELETE FROM IMAGES where recipe_id = $1', [id]),
                                        database.query('DELETE FROM NUTRITION WHERE recipe_id = $1 ', [id]),
                                        database.query('DELETE FROM RECIPE WHERE recipe_id = $1 ', [id], function (err, result) {
                                            if (err) {
                                                logger.error(err);
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
                logger.error(err);
                response.status(401).send(err);
            });
    } else {
        response.status(404).json({
            message: 'Missing Parameters. Bad Request'
        });
    }
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('Delete recipe response time', elapsed);
}
const updateRecipe = (request, response) => {
    logger.info("update recipe call");
    sdc.increment('Update recipe');
    let start = Date.now();
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
                            logger.error(err);
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
                                            logger.error(err);
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
                                                        logger.error(err);
                                                        database.query('ROLLBACK', function (err, result) {
                                                            return response.status(500).json({
                                                                info: 'Couldn\'t read from db'
                                                            });
                                                        });
                                                    } else {
                                                        database.query('DELETE FROM ORDEREDLIST WHERE recipe_id = $1', [recipe.recipe_id], function (err, result) {
                                                            if (err) {
                                                                logger.error(err);
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
                                                                        logger.error(err);
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
                logger.error(err);
                response.status(401).send(err);
            }
        );

    } else {
        return response.status(422).json({
            info: 'Please enter all details'
        });
    }
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('Update recipe response time', elapsed);
}



const getRecipe = (request, response) => {
    logger.info("get recipe call");
    sdc.increment('Get recipe');
    let start = Date.now();
    var id = request.params.id;
    if (id != null) {
        database.query(
            'SELECT recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients from RECIPE \
        where recipe_id = $1', [id],
            function (err, recipeResult) {
                if (err) {
                    logger.error(err);
                    return response.status(500).send({
                        error: 'Error getting recipe'
                    });
                } else {
                    if (recipeResult.rows.length > 0) {
                        recipeResult.rows[0].ingredients = JSON.parse(recipeResult.rows[0].ingredients);
                        database.query("select position, instruction from orderedlist where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultSteps) {
                            if (err) {
                                logger.error(err);
                                return response.status(500).send({
                                    error: 'Error getting recipe'
                                });
                            } else {
                                database.query("select calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams from nutrition where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultNutrition) {
                                    if (err) {
                                        logger.error(err);
                                        return response.status(500).send({
                                            error: 'Error getting recipe'
                                        });
                                    } else {
                                        database.query("select id,url from images where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, imageResult) {
                                            if (err) {
                                                logger.error(err);
                                                return response.status(500).send({
                                                    error: 'Error getting images data'
                                                });
                                            }
                                            return response.status(200).json({
                                                image: imageResult.rows,
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
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('Get recipe response time', elapsed);
}

const getNewRecipe = (request, response) => {
    logger.info("get new recipe call");
    sdc.increment('Get newest recipe')
    let start = Date.now();
    database.query(
        'SELECT recipe_id, created_ts, updated_ts, author_id, cook_time_in_min, prep_time_in_min, total_time_in_min, title, cusine, servings, ingredients from RECIPE \
       ORDER BY created_ts DESC LIMIT 1',
        function (err, recipeResult) {
            if (err) {
                logger.error(err);
                return response.status(500).send({
                    error: 'Error getting recipe'
                });
            } else {
                if (recipeResult.rows.length > 0) {
                    recipeResult.rows[0].ingredients = JSON.parse(recipeResult.rows[0].ingredients);
                    database.query("select position, instruction from orderedlist where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultSteps) {
                        if (err) {
                            logger.error(err);
                            return response.status(500).send({
                                error: 'Error getting recipe'
                            });
                        } else {
                            database.query("select calories, cholesterol_in_mg, sodium_in_mg, carbohydrates_in_grams, protein_in_grams from nutrition where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, resultNutrition) {
                                if (err) {
                                    logger.error(err);
                                    return response.status(500).send({
                                        error: 'Error getting recipe'
                                    });
                                } else {
                                    database.query("select id,url from images where recipe_id = $1", [recipeResult.rows[0].recipe_id], function (err, imageResult) {
                                        if (err) {
                                            logger.error(err);
                                            return response.status(500).send({
                                                error: 'Error getting images data'
                                            });
                                        }
                                        return response.status(200).json({
                                            image: imageResult.rows,
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
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('Get new recipe response time', elapsed);
}

const myrecipes = (request, response) => {
    logger.info('get myRecipes call');
    sdc.increment('Get my recipes');
    let start = Date.now();
    api.authPromise(request).then(
        function (user) {
            const user_id = user.id;
            database.query("BEGIN", function (err, result) {
                database.query("SELECT recipe_id FROM RECIPE WHERE author_id = $1", [user_id], function (err, recipeResult) {
                    if (err) {
                        logger.error(err);
                        console.log(err);
                        database.query('ROLLBACK', function (err, result) {
                            return response.status(500).json({
                                info: 'Couldn\'t read from db'
                            });
                        });
                    } else {
                        if (recipeResult.rows.length == 0) {
                            return response.status(500).json({
                                response: 'user does not have any recipes'
                            });
                        } else {
                            let topicParams = {
                                Name: 'user-recipes-topic'
                            };

                            sns.createTopic(topicParams, (err, data) => {
                                console.log('creating topic');
                                if (err) {
                                    console.log(err);
                                    return response.status(500).json({
                                        err
                                    })
                                } else {

                                    let urlArray = [];
                                    console.log(recipeResult.rows);
                                    recipeResult.rows.forEach(function name(obj) {
                                        urlArray.push(`https://${DOMAIN_NAME}/v1/recipe/${obj.recipe_id}`);
                                    })
                                    console.log(urlArray);
                                    let payload = {
                                        default: 'Hello Cloud Servers',
                                        data: {
                                            email: user.emailaddress,
                                            urlArray
                                        }
                                    };

                                    payload.data = JSON.stringify(payload.data);
                                    payload = JSON.stringify(payload);

                                    let params = {
                                        Message: payload,
                                        TopicArn: data.TopicArn
                                    };
                                    sns.publish(params, (err, data) => {
                                        if (err) console.log(err)
                                        else {
                                            console.log('published notification');
                                            response.status(201).json({
                                                "SNS Response": "Recipe link sent on email :-) !!",
                                                data
                                            });
                                        }

                                    });
                                }
                            });

                        }
                    }
                });
            });
        },
        function (err) {
            logger.error(err);
            response.status(401).send(err);

        });
    let end = Date.now();
    var elapsed = end - start;
    sdc.timing('Get myrecipes response time', elapsed);
}



module.exports = {
    createRecipe,
    deleteRecipe,
    updateRecipe,
    getRecipe,
    getNewRecipe,
    myrecipes
}