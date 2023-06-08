const express = require("express");
const { StatusCodes } = require("http-status-codes");

const {
  getPayment,
  getPayments,
  sanitisePayment,
} = require("../services/payment/payment.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const paymentRoute = () => {
  router.get(
    "/:paymentId",
    asyncWrapper(async (req, res) => {
      try {
        const payment = await getPayment(req.params.paymentId);

        dataResponse(res, StatusCodes.OK, {
          catepaymentgory: { ...sanitisePayment(payment) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      try {
        const payments = await getPayments();

        let sanitisedPayments = [];

        if (req.query.sanitised === "true") {
          for (const payment of payments) {
            sanitisedPayments.push(sanitisePayment(payment));
          }
        } else {
          sanitisedPayments = payments;
        }

        dataResponse(res, StatusCodes.OK, {
          payments: sanitisedPayments,
          count: sanitisedPayments.length,
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get("/", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "paymentRoute",
    });
  });

  return router;
};

module.exports = paymentRoute;
