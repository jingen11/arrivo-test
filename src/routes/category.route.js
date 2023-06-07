const express = require("express");
const { StatusCodes } = require("http-status-codes");

const {
  createCategory,
  getCategory,
  getCategories,
  sanitiseCategory,
} = require("../services/category/category.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const categoryRoute = () => {
  router.get("/health", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "categoryRoute",
    });
  });

  router.get(
    "/:categoryId",
    asyncWrapper(async (req, res) => {
      try {
        const category = await getCategory(req.params.categoryId);

        dataResponse(res, StatusCodes.OK, {
          category: { ...sanitiseCategory(category) },
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
        const categories = await getCategories();

        const sanitisedCategories = [];

        for (const category of categories) {
          sanitisedCategories.push(sanitiseCategory(category));
        }

        dataResponse(res, StatusCodes.OK, {
          categories: sanitisedCategories,
          count: sanitisedCategories.length,
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  return router;
};

module.exports = categoryRoute;
