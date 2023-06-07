const jwt = require("jsonwebtoken");

const sign = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: 30 * 24 * 60 * 60,
  });
};

const verify = (token) => {
  jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  sign,
  verify,
};
