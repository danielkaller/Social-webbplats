process.env.stage = "TEST";

const app = require('../app')
const request = require('supertest')(app)
const chai = require('chai')
const ObjectID = require('mongodb').ObjectId;

const expect = chai.expect

let messageId;
const badID = new ObjectID();

const testMessage = 'test message, this is a test';
const testPost = { message: testMessage };

//Adding 3 users and getting their AuthToken to use in tests below:

let firstuserauthToken;
let firstuserName = "firstuser";
let seconduserAuthToken;
let thirduserAuthToken;

before((done) => {
    request
        .post('/api/register')
        .send({ username: 'firstuser', password: 'firstuser' })
        .end((err, res) => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('message', 'User registered successfully');

            request
                .post('/api/login')
                .send({ username: 'firstuser', password: 'firstuser' })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('token');
                    firstuserauthToken = res.body.token;
                    done();
                });
        });
});

before((done) => {
    request
        .post('/api/register')
        .send({ username: 'seconduser', password: 'seconduser' })
        .end((err, res) => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('message', 'User registered successfully');

            request
                .post('/api/login')
                .send({ username: 'seconduser', password: 'seconduser' })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('token');
                    seconduserAuthToken = res.body.token;
                    done();
                });
        });
});

before((done) => {
    request
        .post('/api/register')
        .send({ username: 'thirduser', password: 'thirduser' })
        .end((err, res) => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('message', 'User registered successfully');

            request
                .post('/api/login')
                .send({ username: 'thirduser', password: 'thirduser' })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('token');
                    thirduserAuthToken = res.body.token;
                    done();
                });
        });
});

before((done) => {
    request
        .post('/api/friend-add?username=seconduser')
        .set('Authorization', `Bearer ${firstuserauthToken}`)
        .end((err, res) => {
            expect(res.statusCode).to.equal(200);

            request
                .post('/api/friend-add?username=firstuser')
                .set('Authorization', `Bearer ${seconduserAuthToken}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
        });
});

let messageUrl;

describe('Message Sending Tests in Home', () => {
    it('Post a message', (done) => {
        request
            .post('/api/messages')
            .set('Authorization', `Bearer ${firstuserauthToken}`)
            .send(testPost)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('status', 'success', 'message', testPost);
                messageId = res.body.message._id;

                console.log("Message ID: ", messageId);
                messageUrl = '/api/messages/id/' + messageId;
                done();
            });
    });

    it('Post a message with too short content', (done) => {
        request
            .post('/api/messages')
            .set('Authorization', `Bearer ${firstuserauthToken}`)
            .send({ message: '' })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('error', 'Message is too short');
                done();
            });
    });

    it('Post a message with too long content', (done) => {
        request
            .post('/api/messages')
            .set('Authorization', `Bearer ${firstuserauthToken}`)
            .send({ message: 'a'.repeat(141) })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('error', 'Message is too long');
                done();
            });
    });
});


describe('Tests on getting messages', () => {
    it('Test getting all messages', (done) => {
        request
        .get('/api/messages')
        .set('Authorization', `Bearer ${firstuserauthToken}`)
        .end((err, res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.have.property('title', 'Home')
            expect(res.body).to.have.property('messages')

            console.log("Message URL: ", messageUrl, " Message id: ", messageId);

            done();
        })
    });

    it ('Test getting a existing specific message', (done) => {
        request
        .get('/api/messages/id/' + messageId)
        .set('Authorization', `Bearer ${firstuserauthToken}`)
        .end((err, res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('status', 'success')
            expect(res.body).to.have.property('message')

            expect(res.body.message).to.have.property('sender', firstuserName)
            expect(res.body.message).to.have.property('message', testMessage)
            expect(res.body.message).to.have.property('read', false)
            expect(res.body.message).to.have.property('_id', messageId)

            done();
        })
    });

    it ('Test getting a specific message with a non existing id', (done) => {
        request
        .get('/api/messages/id/'+ badID)
        .set('Authorization', `Bearer ${firstuserauthToken}`)
        .end((err, res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.body).to.have.property('error', 'Wrong id')

            done();
        })
    });

    it ('Test updating read status to true', (done) => {
        request
        .patch('/api/messages/id/'+ messageId)
        .set('Authorization', `Bearer ${firstuserauthToken}`)
        .send({status: true})
        .end((err, res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.have.property('status', 'success')
            expect(res.body).to.have.property('read', true)
            done();
        });
    });

})


describe('Authentication Tests', () => {
    it('Register a new user', (done) => {
        request
            .post('/api/register')
            .send({ username: 'newuser', password: 'newpassword' })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.have.property('message', 'User registered successfully');
                done();
            });
    });

    it('Attempt to register a user with an existing username', (done) => {
        request
            .post('/api/register')
            .send({ username: 'newuser', password: 'newpassword' })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('error', 'Username is already taken');
                done();
            });
    });

    it('Login with valid credentials', (done) => {
        request
            .post('/api/login')
            .send({ username: 'newuser', password: 'newpassword' })
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('token');
                done();
            });
    });

    it('Login with invalid credentials', (done) => {
        request
            .post('/api/login')
            .send({ username: 'newuser', password: 'wrongpassword' })
            .end((err, res) => {
                expect(res.statusCode).to.equal(401);
                expect(res.body).to.have.property('error', 'Wrong password, please try again');
                done();
            });
    });
});

describe('Messages/Page Tests', () => {
    it('Get messages on a specific page for a friend', (done) => {
        request
            .get('/api/messages/seconduser')
            .set('Authorization', `Bearer ${firstuserauthToken}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('title', 'seconduser');
                expect(res.body).to.have.property('messages');
                done();
            });
    });

    it('Try posting a message on a specific page for a friend', (done) => {
        request
            .post('/api/messages/seconduser')
            .set('Authorization', `Bearer ${firstuserauthToken}`)
            .send({ message: 'test message', time: Date.now() })
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('status', 'success');
                expect(res.body).to.have.property('message');
                done();
            });
    });

    it('Get messages on a specific page for a user which you are not friends with', (done) => {
        request
            .get('/api/messages/seconduser')
            .set('Authorization', `Bearer ${thirduserAuthToken}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(401);
                expect(res.body).to.have.property('error', 'Unauthorized access');
                done();
            });
    });
});
