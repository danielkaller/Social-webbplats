const express = require('express');
const router = express.Router();

const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const auth = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtKey } = require('../secrets')
const { Server } = require('socket.io');
let dataBase;

const dbURI = 'mongodb://localhost:27017';
const client = new MongoClient(dbURI);

if (process.env.stage === "TEST") {
    console.log("TEST")
    client.db('testDB').dropDatabase();
    dataBase = client.db('testDB');
} else {
    dataBase = client.db('developStageDB');
}


const io = new Server({
    cors: {
        origin: "*"
    }
});


io.use(async (socket, next) => {
    const header = socket.handshake.headers['authorization'];
    console.log(header);

    const token = header.split(' ')[1];
    jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
            next(new Error('authentication error'));
        }
        next();
    });
});
io.on("connection", (socket) => {
    socket.emit("messages", "world");
});
io.listen(4000);


function isAlphanumeric(inputString) {
    const regex = /^[a-zA-Z0-9]*$/;

    return regex.test(inputString);
}

function findUser(req, res, next) {
    const username = res.locals.auth.username;
    dataBase.collection('users').findOne({ username })
        .then((user) => {
            if (user) {
                res.locals.user = user;
                next();
            } else {
                res.sendStatus(401);
            }
        })
        .catch((err) => {
            console.error('Error finding user:', err);
            res.sendStatus(500);
        });
}

function pageAuth(req, res, next) {
    const user = res.locals.user;
    const page = req.params.page;

    if (user.friends.includes(page) || page === user.username) {
        console.log('He is your friend, or it is you');
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized access' });
    }
}

router.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        //Removing blankspaces in lead and trail
        const cleanedUsername = username.trim();
        const cleanedPassword = password.trim();

        console.log("Before trim: ", username, "After trim: ", cleanedUsername);

        //Checks to see if the inputed Username and Password follow the rules for length
        if (cleanedUsername.length > 36) {
            return res.status(400).json({ error: 'Username must be 36 characters long or lower' });
        }

        //Checks to see if the inputed Username and Password follow the rules for length
        if (cleanedPassword.length < 6 && cleanedUsername.length < 6) {
            return res.status(400).json({ error: 'Password and Username must be at least 6 characters long' });
        } else if (cleanedPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        } else if (cleanedUsername.length < 6) {
            return res.status(400).json({ error: 'Username must be at least 6 characters long' });
        }

        //Checks to see if the inputed Username and Password follow the rules for only containing letters and numbers
        if (!isAlphanumeric(cleanedUsername) && !isAlphanumeric(cleanedPassword)) {
            return res.status(400).json({ error: 'Username and Password can only contain letters and numbers' });
        } else if (!isAlphanumeric(cleanedUsername)) {
            return res.status(400).json({ error: 'Username can only contain letters and numbers' });
        } else if (!isAlphanumeric(cleanedPassword)) {
            return res.status(400).json({ error: 'Password can only contain letters and numbers' });
        }

        // Check if the username already exists in the database
        const existingUser = await dataBase.collection('users').findOne({ username: cleanedUsername });
        console.log("EXISTING USER: ", dataBase.collection('users').findOne({ username: cleanedUsername }))
        if (existingUser) {
            console.log("EXISTING USER: ", existingUser)
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(cleanedPassword, 10);


        // Insert the user into the MongoDB database
        await dataBase.collection('users').insertOne({ username: cleanedUsername, password: hashedPassword, friends: [], pendingRequests: [] });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Retrieve the user from the MongoDB database by username
        const user = await dataBase.collection('users').findOne({ username });

        if (!user) {
            return res.status(400).json({ error: 'There is no user by the name of: ' + username });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong password, please try again' });
        }

        // Generate a JWT token
        const token = jwt.sign({ username: user.username }, jwtKey);

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/users', auth, findUser, async (req, res) => {
    try {
        const searchInput = req.query.username;
        const currentUser = res.locals.user;

        const regex = new RegExp(searchInput, 'i');
        const query = { username: regex, _id: { $ne: currentUser._id } };


        const users = await dataBase.collection('users').find(query).toArray();
        const usernames = users.map(u => u.username);

        res.json(usernames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/username', auth, findUser, (req, res) => {
    const user = res.locals.user;
    res.json({ username: user.username })
})

router.get('/api/friends', auth, findUser, async (req, res) => {
    try {
        const user = res.locals.user;

        const friends = user.friends;
        const pendingRequests = user.pendingRequests;
        const sentRequests = user.sentRequests;

        res.status(200).json({ friends, pendingRequests, sentRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

})

router.post('/api/friend-add', auth, findUser, async (req, res) => {
    try {
        const targetName = req.query.username;

        const targetUser = await dataBase.collection('users').findOne({ username: targetName });

        if (!targetUser) {
            return res.status(404).json({ error: 'There is no user with that username' })
        }

        const currentUser = res.locals.user;
        const currentUserName = currentUser.username

        // Check if currentUser and targetUser are already friends
        if (currentUser.friends.includes(targetName) && targetUser.friends.includes(currentUserName)) {
            return res.status(404).json({ error: 'You are already friends' });
        }

        // Check if currentUser has already sent a friend request to targetUser
        if (targetUser.pendingRequests.includes(currentUserName)) {
            return res.status(404).json({ error: 'You have already sent a friend request to ' + targetName });
        }

        // Check if targetUser has already sent a friend request to currentUser
        if (currentUser.pendingRequests.includes(targetName)) {
            // Accept the friend request
            await dataBase.collection('users').updateOne(
                { username: targetUser.username },
                {
                    $push: {
                        friends: currentUser.username,
                    }
                }
            );

            await dataBase.collection('users').updateOne(
                { username: currentUser.username },
                {
                    $push: {
                        friends: targetUser.username,
                    }
                }
            );

            await dataBase.collection('users').updateOne(
                { username: currentUser.username },
                {
                    $pull: {
                        pendingRequests: targetUser.username,
                    }
                }
            );
            return res.status(200).json({ message: 'Success, you are now friends since a friend request had already been sent by ' + targetName, friends: currentUser.friends });
        }

        // If none of the above conditions are met, send a friend request
        await dataBase.collection('users').updateOne(
            { username: targetName },
            {
                $push: {
                    pendingRequests: currentUser.username,
                },
            }
        );

        return res.status(200).json({ message: 'Successfully sent friend request to' + targetName });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/api/messages', auth, (req, res) => {

    dataBase.collection('messages').find({ page: null }).sort({ time: -1 }).toArray()
        .then((result) => {
            res.status(200).json({ title: "Home", messages: result });
        })
        .catch((err) => {
            console.log(err);
        });
});

router.get('/api/messages/:page', auth, findUser, pageAuth, (req, res) => {

    const page = req.params.page;

    dataBase.collection('messages').find({ page }).sort({ time: -1 }).toArray()
        .then((result) => {
            res.status(200).json({ title: page, messages: result });
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post('/api/messages', auth, findUser, (req, res) => {

    const text = req.body.message.trim();
    const sender = res.locals.user.username;
    const date = req.body.time;

    console.log("Received message:", text, "; from sender:", sender, "; Time:", date);


    if (text.length >= 140) {
        return res.status(400).json({ error: 'Message is too long' });
    } else if (text.length == 0) {
        return res.status(400).json({ error: 'Message is too short' });
    }

    const newMessage = {
        sender: sender,
        message: text,
        read: false,
        time: date,
    };

    dataBase.collection('messages').insertOne(newMessage)
        .then((result) => {
            io.emit("messages", newMessage)
            res.status(200).json({ status: 'success', message: newMessage });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ status: 'Error' });
        });
});

router.post('/api/messages/:page', auth, findUser, pageAuth, (req, res) => {

    const page = req.params.page;
    const text = req.body.message.trim();
    const sender = res.locals.auth.username
    const date = req.body.time;

    console.log("Received message:", text, "; from sender:", sender, "; Time:", date);


    if (text.length == 0 || text.length >= 140) {
        console.log("The message: ", text, "is not valid");
        return res.status(400).json({ status: 'failure' });
    } else {
        console.log("The message:", text, "is valid");
    }

    const newMessage = {
        sender: sender,
        message: text,
        read: false,
        time: date,
        page: page
    };

    dataBase.collection('messages').insertOne(newMessage)
        .then((result) => {
            res.status(200).json({ status: 'success', message: newMessage });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ status: 'Error' });
        });
});

router.get('/api/messages/id/:id', auth, (req, res) => {

    let id;
    try {
        id = new ObjectID(req.params.id);
    } catch {
        return res.status(400).json({ error: 'Incorrect ID format' });
    }

    dataBase.collection('messages').findOne({ _id: id })
        .then((result) => {
            if (result === null) {
                res.status(400).json({ error: 'Wrong id' });
            } else {
                res.status(200).json({ status: "success", message: result });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

router.patch('/api/messages/id/:id', auth, (req, res) => {
    let id;
    try {
        id = new ObjectID(req.params.id);
    } catch {
        return res.status(400).json({ status: "incorrect id" })
    }

    const status = req.body.status
    console.log("new Status: ", status)

    if (typeof status !== 'boolean') {
        return res.status(400).json({ status: 'Bad data' })
    }

    dataBase.collection('messages').updateOne(
        { _id: id },
        { $set: { read: status } }
    )
        .then((result) => {
            if (result.matchedCount === 0) {
                res.status(400).json({ status: 'failure' });
            } else {
                res.status(200).json({ status: 'success' , read: status});
            }
        })
        .catch((err) => {
            console.log(err);
        });
});


module.exports = router;