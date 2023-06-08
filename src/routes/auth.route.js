const express = require("express");
const { StatusCodes } = require("http-status-codes");

const {
  login,
  SUPERADMIN,
  sanitiseUser,
} = require("../services/user/user.service");
const { sign } = require("../services/session");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const authRoute = () => {
  router.post(
    "/login",
    asyncWrapper(async (req, res) => {
      try {
        const user = await login(req.body.cred, req.body.password);

        let token;

        if (user === SUPERADMIN) {
          token = sign({
            userId: user.userId,
            username: user.username,
            membership: user.membership,
          });
        } else {
          const sanitisedUser = sanitiseUser(user);

          token = sign({
            userId: sanitisedUser.userId,
            username: sanitisedUser.username,
            membership: sanitisedUser.membership,
          });
        }

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
