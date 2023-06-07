const express = require("express");
const { StatusCodes } = require("http-status-codes");

const {
  createCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
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

        if (!category) {
          return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "no category found"
          );
        }

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

        let sanitisedCategories = [];

        if (req.query.sanitised === "true") {
          for (const category of categories) {
            sanitisedCategories.push(sanitiseCategory(category));
          }
        } else {
          sanitisedCategories = categories;
        }

        dataResponse(res, StatusCodes.OK, { categories: sanitisedCategories });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.post(
    "/",
    asyncWrapper(async (req, res) => {
      try {
        const category = await createCategory(req.body.category);

        dataResponse(res, StatusCodes.CREATED, {
          category: { ...sanitiseCategory(category) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.put(
    "/:categoryId",
    asyncWrapper(async (req, res) => {
      try {
        const category = await updateCategory(
          req.params.categoryId,
          req.body.category
        );

        dataResponse(res, StatusCodes.OK, {
          category: { ...sanitiseCategory(category) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.delete(
    "/:categoryId",
    asyncWrapper(async (req, res) => {
      try {
        await deleteCategory(req.params.categoryId);

        dataResponse(res, StatusCodes.NO_CONTENT, {});
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  return router;
};

module.exports = categoryRoute;
