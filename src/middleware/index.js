const { StatusCodes } = require("http-status-codes");

const { errorResponse } = require("../utils/response.helper");
const { verify } = require("../services/session");

const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "No authorization headers"
    );
  }

  const authTokenArray = req.headers.authorization.split(" ");

  if (authTokenArray.length !== 2) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Bad authorization header values"
    );
  }

  if (authTokenArray[0].length === 0 || authTokenArray[0] !== "Bearer") {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Bad authorization header values"
    );
  }

  if (authTokenArray[1].length === 0) {
    return errorResponse(res, StatusCodes.UNAUTHORIZED, "Empty token value");
  }

  try {
    req.user = verify(authTokenArray[1]);
  } catch (error) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      error.message,
      error.stack
    );
  }

  req.authToken = authTokenArray[1];

  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user.membership !== 2) {
    return errorResponse(res, StatusCodes.FORBIDDEN, "only admin is allowed");
  }

  next();
};

const asyncWrapper = (fn) => {
  return (req, res, next) => {
    (async () => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    })();
  };
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  asyncWrapper,
};
