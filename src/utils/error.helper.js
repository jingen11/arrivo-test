const errorResponse = (res, statusCode, message, stackTrace) => {
  return res.status(statusCode).json({
    error: {
      statusCode: statusCode,
      message: message,
      stackTrace,
    },
  });
};

module.exports = {
  errorResponse,
};
