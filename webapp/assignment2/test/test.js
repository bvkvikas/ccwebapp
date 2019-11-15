let chai = require('chai');
let chaiHttp = require('chai-http');
let server = "http://localhost:3005";
let should = chai.should();

chai.use(chaiHttp);
let recipe_id = "";
describe("Create user", () => {
    it('it should create the user when all details are passed', (done) => {
        chai.request(server)
            .post('/v2/user')
            .send({
                "emailaddress": "thunderstorm@gmail.com",
                "password": "Test@1234",
                "firstname": "TestingAccount1",
                "lastname": "TestingAccount2"
            })

            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should throw error when user already exists', (done) => {
        chai.request(server)
            .post('/v2/user')
            .send({
                "firstname": "TestingAccount1",
                "lastname": "TestingAccount2",
                "password": "Testing@1234",
                "emailaddress": "thunderstorm@gmail.com"
            })

            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should throw error when password is not strong enough', (done) => {
        chai.request(server)
            .post('/v2/user')
            .send({
                "firstname": "TestingAccount1",
                "lastname": "TestingAccount2",
                "password": "Testing1234",
                "emailaddress": "tester@gmail.com"
            })

            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should throw error when email is invalid', (done) => {
        chai.request(server)
            .post('/v2/user')
            .send({
                "firstname": "TestingAccount1",
                "lastname": "TestingAccount2",
                "password": "Testing@1234",
                "emailaddress": "testgmail.com"
            })

            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should throw error when all the details are not given', (done) => {
        chai.request(server)
            .post('/v2/user')
            .send({
                "firstname": "TestingAccount1",
                "password": "Testing@1234",
                "emailaddress": "testing@gmail.com"
            })

            .end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                done();
            });
    });
});
describe("Login and get user", () => {
    it('it should validate user if correct', (done) => {
        chai.request(server)
            .get('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should validate user if non correct, return unauthorized', (done) => {
        chai.request(server)
            .get('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:krishna@123").toString("base64"))
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe("Update", () => {
    it('it should update the user details when login is succesful', (done) => {
        chai.request(server)
            .put('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "firstname": "Jane",
                "lastname": "Doe",
                "password": "Test@1234",
                "emailaddress": "thunderstorm@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('it should throw an error if body email and auth user are different', (done) => {
        chai.request(server)
            .put('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "firstname": "Jane",
                "lastname": "Doe",
                "password": "Vikas@1234",
                "emailaddress": "bvkvikas@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should throw an error if password is not strong enough', (done) => {
        chai.request(server)
            .put('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "firstname": "Jane",
                "lastname": "Doe",
                "password": "Vikas1234",
                "emailaddress": "thunderstorm@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });

    });
    it('it should update when only first name and last name are given', (done) => {
        chai.request(server)
            .put('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "firstname": "TestUpdated1",
                "lastname": "TestUpdated2",
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });

    });
    it('it should update when only first name or last name are missing', (done) => {
        chai.request(server)
            .put('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "firstname": "TestUpdated"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

});



describe("Create recipe", () => {

    it('it should create the recipe when all details are passed', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })

            .end((err, res) => {
                recipe_id = res.body.info.recipe_id;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('it should not create a recipe when cook time is not multiple of 5', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 3,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })

            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should not create a recipe when prep time is not multiple of 5', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 3,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })

            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should not create a recipe when cook time and prep time is not multiple of 5', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 3,
                "prep_time_in_min": 3,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })

            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should not create a recipe when serving is more than 5', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 6,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })

            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should create a recipe serving is less than 5', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Pasta 2222",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })

            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe("get recipe", () => {

    it('verify if recipe does not exist', (done) => {
        chai.request(server)
            .get(`/v1/recipe/wohoooo`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                done();
            });
    });

    it('get recipe info', (done) => {
        chai.request(server)
            .get(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe("Update recipe", () => {

    it('Verify update without authorization', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });


    it('validate user is authorized to update a recipe', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 500,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 553.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('validate user not able to update a recipe when cook time is not multiple of 5', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 3,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('validate user not able to update a recipe when prep time is not multiple of 5', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 3,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('validate user not able to update a recipe when cook time and prep time is not multiple of 5', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 3,
                "prep_time_in_min": 3,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 2,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });
    it('validate user not able to update a recipe when serving is more than 5', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 6,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('validate user not able to update a recipe when serving is less than 1', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 0,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(450);
                res.body.should.be.a('object');
                done();
            });
    });

    it('validate user not able to update a recipe when all details are not entered', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                done();
            });
    });

    it('validate user is able to update a recipe when all details are entered', (done) => {
        chai.request(server)
            .put(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .send({
                "cook_time_in_min": 15,
                "prep_time_in_min": 15,
                "title": "Creamy Cajun Chicken Pasta",
                "cusine": "Italian",
                "servings": 4,
                "ingredients": [
                    "4 ounces linguine pasta",
                    "2 boneless, skinless chicken breast halves, sliced into thin strips",
                    "2 teaspoons Cajun seasoning",
                    "2 tablespoons butter"
                ],
                "steps": [{
                    "position": 1,
                    "instruction": "test instructions"
                }],
                "nutrition_information": {
                    "calories": 100,
                    "cholesterol_in_mg": 4.0,
                    "sodium_in_mg": 100,
                    "carbohydrates_in_grams": 53.7,
                    "protein_in_grams": 53.7
                }
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe("Delete Recipe", () => {

    it('Validate if recipe id is null', (done) => {
        chai.request(server)
            .delete('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                done();
            });
    });
    it('Validate if user is not authorized to delete a recipe', (done) => {
        chai.request(server)
            .delete(`/v1/recipe/${recipe_id}`)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });
    it('Delete recipe', (done) => {
        chai.request(server)
            .delete(`/v1/recipe/${recipe_id}`)
            .set("Authorization", "basic " + new Buffer("thunderstorm@gmail.com:Test@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });



});