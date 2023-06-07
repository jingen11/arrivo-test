require("dotenv").config();
global.isProdEnv = process.env.NODE_ENV === "production";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const { StatusCodes } = require("http-status-codes");

const db = require("./src/services/db");
const authRouter = require("./src/routes/auth.route");
const adminRouter = require("./src/routes/admin.route");
const postRouter = require("./src/routes/post.route");
const categoryRouter = require("./src/routes/category.route");
const { authMiddleware, adminMiddleware } = require("./src/middleware");
const { errorResponse } = require("./src/utils/response.helper");
const app = express();
const PORT = process.env.PORT || 8000;

const main = async () => {
  await db.init("./initDb.sql");

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

  app.use("/api/v1/auth", authRouter());
  app.use("/api/v1/admin", authMiddleware, adminMiddleware, adminRouter());
  app.use("/api/v1/posts", authMiddleware, postRouter());
  app.use("/api/v1/categories", authMiddleware, categoryRouter());

  app.use("/", authMiddleware, (req, res) => {
    res.json({ success: true, message: "protected" });
  });

  app.use((err, req, res, next) => {
    console.log(err);

    errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      err.message,
      err.stack
    );
  });

  app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}...`);
  });
};

main();

process.on("uncaughtException", (err) => {
  console.error("uncaughtException: %o", err);
});

process.on("exit", async () => {
  console.log("exit....");
  await db.end();
});
