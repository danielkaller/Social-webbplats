const jwt = require("jsonwebtoken");
const keys = require("../../config/secret-keys");
const bcrypt = require("bcrypt");

module.exports = {
  verify: async (req, res, next) => {
    const token = req.headers.authorization;
    jwt.verify(token, keys.JWT, function(error, decoded) {
      if (error) res.sendStatus(403);
      else next();
    });
  },
  add: async (req, res) => {
    const password = req.body.password;
    const user = req.body.user;
    if (user === "admin" || user === "guest") {
      const hash = keys.bcrypt.hash[user];
      const match = await bcrypt.compare(password, hash);
      if (!match) res.sendStatus(403);
      else {
        const data = {
          user
        };
        const token = await jwt.sign(data, keys.JWT);
        res.end(token);
      }
    } else res.sendStatus(403)
  }
};