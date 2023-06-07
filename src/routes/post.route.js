const express = require("express");
const { StatusCodes } = require("http-status-codes");

const { register, login } = require("../services/user/user.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const postRoute = () => {
  router.get("/", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "postRoute",
    });
  });

  return router;
};

module.exports = postRoute;
