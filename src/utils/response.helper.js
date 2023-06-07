const { StatusCodes } = require("http-status-codes");

const errorResponse = (
  res,
  statusCode = StatusCodes.BAD_REQUEST,
  message,
  stackTrace
) => {
  return res.status(statusCode).json({
    error: {
      statusCode: statusCode,
      message: message,
      stackTrace: stackTrace ?? "",
    },
  });
};

const dataResponse = (res = StatusCodes.OK, statusCode, data) => {
  return res.status(statusCode).json({
    data: {
      ...data,
    },
  });
};

module.exports = {
  errorResponse,
  dataResponse,
};
