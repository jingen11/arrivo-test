const Pool = require("pg").Pool;
const fs = require("fs");

const pool = new Pool({
  host: "localhost",
  user: "nodejs",
  password: "nodejs",
  database: "arrivo",
  idleTimeoutMillis: 20000,
  allowExitOnIdle: true,
});
let interval;

const init = async (initDbScriptPath) => {
  const initDb = fs.readFileSync(initDbScriptPath, { encoding: "utf-8" });

  await query(initDb);

  interval = setInterval(async () => {
    console.log("ping postgres...");
    await query("SELECT NOW()");
  }, 10000);
};

const query = async (statement, params = []) => {
  return await pool.query(statement, params);
};

const select = async (statement, params = []) => {
  const result = await query(statement, params);

  return result.rows;
};

const end = async () => {
  await pool.end();
  clearInterval(interval);
};

module.exports = {
  init,
  query,
  select,
  end,
};
