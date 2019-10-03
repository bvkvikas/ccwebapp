let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);
describe("Login and get user", () => {
    it('it should validate user if correct', (done) => {
        chai.request(server)
            .get('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("test@gmail.com:Vikas@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should validate user if non correct, return unauthorized', (done) => {
        chai.request(server)
            .get('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("test@gmail.com:krishna@123").toString("base64"))
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
            .set("Authorization", "basic " + new Buffer("test@gmail.com:Vikas@1234").toString("base64"))
            .send({
                "firstname": "Jane",
                "lastname": "Doe",
                "password": "Vikas@1234",
                "emailaddress": "test@gmail.com"
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
            .set("Authorization", "basic " + new Buffer("test@gmail.com:Vikas@12345").toString("base64"))
            .send({
                "firstname": "Jane",
                "lastname": "Doe",
                "password": "Vikas@1234",
                "emailaddress": "bvkvikas@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should throw an error if password is not strong enough', (done) => {
        chai.request(server)
            .put('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("test@gmail.com:Vikas@1234").toString("base64"))
            .send({
                "firstname": "Jane",
                "lastname": "Doe",
                "password": "Vikas1234",
                "emailaddress": "bvkvikas@gmail.com"
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
            .set("Authorization", "basic " + new Buffer("test@gmail.com:Vikas@1234").toString("base64"))
            .send({
                "firstname": "Test1",
                "lastname": "Test2",
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
            .set("Authorization", "basic " + new Buffer("test@gmail.com:Vikas@1234").toString("base64"))
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

describe("Create user", () => {
    it('it should create the user when all details are passed', (done) => {
        chai.request(server)
            .post('/v1/user')
            .send({
                "firstname": "TestingAccount1",
                "lastname": "TestingAccount2",
                "password": "Testing@1234",
                "emailaddress": "tester13@gmail.com"
            })

            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should throw error when user already exists', (done) => {
        chai.request(server)
            .post('/v1/user')
            .send({
                "firstname": "TestingAccount1",
                "lastname": "TestingAccount2",
                "password": "Testing@1234",
                "emailaddress": "tester@gmail.com"
            })

            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should throw error when password is not strong enough', (done) => {
        chai.request(server)
            .post('/v1/user')
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
            .post('/v1/user')
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
            .post('/v1/user')
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

describe("Create recipe", () => {

    it('it should create the recipe when all details are passed', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
    it('it should not create a recipe when cook time is not multiple of 5', (done) => {
        chai.request(server)
            .post('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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

    it('Delete recipe', (done) => {
        chai.request(server)
            .delete('/v1/recipe/a93f4d05-113a-430b-b2ec-93e985bc9ec4')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
            .end((err, res) => {
                res.should.have.status(204);
                res.body.should.be.a('object');
                done();
            });
    });
    it('Validate if recipe id is null', (done) => {
        chai.request(server)
            .delete('/v1/recipe/')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Validate if user is not authorized to delete a recipe', (done) => {
        chai.request(server)
            .delete('/v1/recipe/2e1b167b-2c9c-4ba5-b589-9be0f73a7119')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe("get recipe", () => {

    it('verify if recipe does not exist', (done) => {
        chai.request(server)
            .get('/v1/recipe/b3745338-db3d-4e6d-a026-a16825b985b8')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                done();
            });
    });

    it('get recipe info', (done) => {
        chai.request(server)
            .get('/v1/recipe/1fa19d65-0d87-4d1b-b73a-fb8c2c286b6a')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});
describe("update recipe", () => {

    it('validate user is not authorized to update a recipe', (done) => {
        chai.request(server)
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
    it('validate user not able to update a recipe when cook time is not multiple of 5', (done) => {
        chai.request(server)
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/51ad79d6-6aeb-4849-92cd-1c9eca8236ac')
            .set("Authorization", "basic " + new Buffer("2jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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
            .put('/v1/recipe/5accc5ae-f77b-46f8-ad20-baa226c04dd0')
            .set("Authorization", "basic " + new Buffer("6jain_rick@gmail.com:Rick@12345").toString("base64"))
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
                "steps": [
                    {
                        "position": 1,
                        "instruction": "test instructions"
                    }
                ],
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