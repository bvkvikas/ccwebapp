let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);
describe("Login and get user", () => {

    it('it should validate user if correct', (done) => {
        chai.request(server)
            .get('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("bvkvikas@gmail.com:Vikas@1234").toString("base64"))
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('it should validate user if non correct, return unauthorized', (done) => {
        chai.request(server)
            .get('/v1/user/self')
            .set("Authorization", "basic " + new Buffer("krish@gmail.com:krishna@123").toString("base64"))
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
                "emailaddress": "tester@gmail.com"
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