require("dotenv").config();
global.isProdEnv = process.env.NODE_ENV === "production";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const db = require("./src/services/db");
const app = express();
const PORT = process.env.PORT || 8000;
const authRouter = require("./src/routes/auth.route");
const { authMiddleware } = require("./src/middleware");

const main = async () => {
  await db.init("./initDb.sql");

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

  app.use("/api/v1/auth", authRouter());

  app.use("/", authMiddleware, (req, res) => {
    res.json({ success: true, message: "protected" });
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
