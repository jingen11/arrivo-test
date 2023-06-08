const express = require("express");
const { StatusCodes } = require("http-status-codes");

const { makePayment } = require("../services/payment/payment.service");
const {
  getUser,
  updateUser,
  sanitiseUser,
} = require("../services/user/user.service");
const { sign } = require("../services/session");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const paymentRoute = () => {
  router.post(
    "/make",
    asyncWrapper(async (req, res) => {
      if (req.user.membership !== 0) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "already a premium user"
        );
      }

      try {
        const user = await getUser(req.user.userId);

        let sanitisedUser = sanitiseUser(user);

        await makePayment({
          description: `membership upgrade for user ${req.user.userId}`,
          email: sanitisedUser.email,
          name: sanitisedUser.fullName,
          amount: 2000,
        });

        const updatedUser = await updateUser(req.user.userId, {
          membership: 1,
        });

        sanitisedUser = sanitiseUser(updatedUser);

        const token = sign({
          userId: sanitisedUser.userId,
          username: sanitisedUser.username,
          membership: sanitisedUser.membership,
        });

        dataResponse(res, StatusCodes.ACCEPTED, { token });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get("/health", (req, res) => {
    console.log(req.user);
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "paymentRoute",
    });
  });

  return router;
};

module.exports = paymentRoute;
