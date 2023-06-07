const express = require("express");
const { StatusCodes } = require("http-status-codes");

const {
  getUser,
  getUsers,
  sanitiseUser,
  updateUser,
  deleteUser,
} = require("../services/user/user.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const userRoute = () => {
  router.get("/health", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "userRoute",
    });
  });

  router.get(
    "/:userId",
    asyncWrapper(async (req, res) => {
      try {
        const user = await getUser(req.params.userId);

        dataResponse(res, StatusCodes.OK, { user: { ...sanitiseUser(user) } });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      try {
        const users = await getUsers();

        let sanitisedUsers = [];

        if (req.query.sanitised === "true") {
          for (const user of users) {
            sanitisedUsers.push(sanitiseUser(user));
          }
        } else {
          sanitisedUsers = users;
        }

        dataResponse(res, StatusCodes.OK, {
          users: sanitisedUsers,
          count: sanitisedUsers.length,
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.put(
    "/:userId",
    asyncWrapper(async (req, res) => {
      try {
        const user = await updateUser(req.params.userId, req.body.user);

        dataResponse(res, StatusCodes.OK, { user: { ...sanitiseUser(user) } });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.delete(
    "/:userId",
    asyncWrapper(async (req, res) => {
      try {
        await deleteUser(req.params.userId);

        dataResponse(res, StatusCodes.NO_CONTENT, {});
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  return router;
};

module.exports = userRoute;
