const express = require('express');

const { MongoClient } = require('mongodb');

const indexRouter = require('./routes/index.js');

const app = express();
const port = 3000;

const corsMiddleware = require('./cors');
app.options('*', corsMiddleware);
app.use(corsMiddleware);

app.use(express.static('public'))
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', indexRouter);

console.log("ENV: ", process.env.stage);

//const dbURI = 'mongodb+srv://liu123:123@testingstuff.7zcamlz.mongodb.net/simple-testing?retryWrites=true&w=majority';

// ### when on linux and using docker and using the docker-compose.yml ###
//const dbURI = 'mongodb://localhost:27017'

// ### when at home on windows ###
// med korrekt fixad mongodb och mongosh

//const dbURI = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.6"
//starta en client

const dbURI = 'mongodb://localhost:27017';
const client = new MongoClient(dbURI);

client.db.users

let dataBase


client.connect()
    .then((result) => {
        console.log("connected successfully, now listening on port 3000")
        if(process.env.stage === "TEST"){
            console.log("TEST")
            client.db('testDB').dropDatabase();
            dataBase = client.db('testDB');
        } else {
            dataBase = client.db('developStageDB');
        }

        app.listen(port);
    })
    .catch((err) => {
        console.log(err, "i died :(");
    });


app.use((req, res) => {
    try {
        res.sendFile('public/index.html', { root: __dirname })
    } catch {
        res.status(404).json({ error: 404 })
    }
    res.sendFile('public/index.html', { root: __dirname })
});


function runServer(port) {
    let server = app.listen(8888, () => {
    })
    return (server)
}

module.exports = runServer;
module.exports = app;