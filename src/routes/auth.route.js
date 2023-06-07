const express = require("express");
const { StatusCodes } = require("http-status-codes");

const { login } = require("../services/user/user.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const authRoute = () => {
  router.post(
    "/login",
    asyncWrapper(async (req, res) => {
      try {
        const token = await login(req.body.cred, req.body.password);

        return dataResponse(res, StatusCodes.OK, { token });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get("/", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "authRoute",
    });
  });

  return router;
};

module.exports = authRoute;
