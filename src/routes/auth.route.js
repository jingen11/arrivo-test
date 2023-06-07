const express = require("express");
const { StatusCodes } = require("http-status-codes");

const { register, login } = require("../services/user/user.service");
const { errorResponse } = require("../utils/error.helper");

const router = express.Router();

const authRoute = () => {
  router.post("/login", (req, res) => {
    (async () => {
      try {
        const token = await login(req.body.cred, req.body.password);

        return res.json({ data: { token } });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })();
  });

  router.post("/register", (req, res) => {
    (async () => {
      try {
        const user = await register(req.body);

        return res.json({ data: { ...user } });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })();
  });

  return router;
};

module.exports = authRoute;
