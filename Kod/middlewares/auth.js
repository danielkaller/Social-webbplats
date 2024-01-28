// middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtKey } = require("../secrets")

function authenticate(req, res, next) {
    const token = req.header('Authorization').split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.locals.auth = decoded;
        next();
    });
}

module.exports = authenticate;