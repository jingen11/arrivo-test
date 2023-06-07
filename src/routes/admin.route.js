const express = require("express");
const { StatusCodes } = require("http-status-codes");

const { register, sanitiseUser } = require("../services/user/user.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");
const categoryRoute = require("./admin.category.route");
const paymentRoute = require("./payment.route");
const postRoute = require("./admin.post.route");
const userRoute = require("./user.route");

const router = express.Router();

const adminRoute = () => {
  router.use("/categories", categoryRoute());
  router.use("/payments", paymentRoute());
  router.use("/posts", postRoute());
  router.use("/users", userRoute());

  router.post(
    "/register",
    asyncWrapper(async (req, res) => {
      try {
        const user = await register(req.body);

        return dataResponse(res, StatusCodes.CREATED, {
          user: { ...sanitiseUser(user) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get("/", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "adminRoute",
    });
  });

  return router;
};

module.exports = adminRoute;
