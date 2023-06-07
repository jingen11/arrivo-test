const uuid = require("uuid");

const db = require("../db");
const { sign } = require("../session");
const { encrypt, decrypt } = require("../../utils/crypto.helper");

const emailRegex = /^([\w-\.]{4,})+@(([\w-]{4,})+\.)+[\w-]{2,4}$/g;
const passwordRegex = /^(?=.*[A-Za-z])(([A-Za-z])(?=.*\d)).{5,255}$/g;

const register = async (user) => {
  if (!user) {
    throw new Error("no parameters found");
  }

  if (!user.email || !user.email.trim()) {
    throw new Error("email cannot be empty");
  }

  if (!user.username || !user.username.trim()) {
    throw new Error("username cannot be empty");
  }

  if (!user.fullName || !user.fullName.trim()) {
    throw new Error("fullName cannot be empty");
  }

  if (!user.password || !user.password.trim()) {
    throw new Error("password cannot be empty");
  }

  if (!user.confirmPassword || !user.confirmPassword.trim()) {
    throw new Error("confirm password cannot be empty");
  }

  if (user.membership !== 1) user.membership = 0;

  const email = user.email.trim();
  const username = user.username.trim();
  const fullName = user.fullName.trim();
  const password = user.password.trim();
  const confirmPassword = user.confirmPassword.trim();

  if (!email.match(emailRegex)) {
    throw new Error("invalid email format");
  }

  if (username.length < 6) {
    throw new Error("username must contain at least 6 characters");
  }

  if (!password.match(passwordRegex)) {
    throw new Error(
      "invalid password format. Password must contains at least 6 letters, a capital letter, a digit and start with an alphabet"
    );
  }

  if (password !== confirmPassword) {
    throw new Error("passwords do not match");
  }

  const encryptedPassword = encrypt(password);

  const userId = uuid.v4();

  try {
    await db.query(
      `INSERT INTO "user"(userId, username, password, email, fullName, membership) VALUES ($1, $2, $3, $4, $5, $6);`,
      [userId, username, encryptedPassword, email, fullName, user.membership]
    );
  } catch (error) {
    if (
      error.message ===
      'duplicate key value violates unique constraint "user_username_key"'
    ) {
      throw new Error("username already exists");
    }

    if (
      error.message ===
      'duplicate key value violates unique constraint "user_email_key"'
    ) {
      throw new Error("email already exists");
    }

    throw error;
  }

  return { userId, username, email, fullName, membership: user.membership };
};

const login = async (cred, password) => {
  if (!cred || !cred.trim()) {
    throw new Error("username or email cannot be empty");
  }

  if (!password || !password.trim()) {
    throw new Error("password cannot be empty");
  }

  const userList = await db.select(
    `SELECT * FROM "user" WHERE email = $1 OR username = $1;`,
    [cred]
  );

  if (userList.length === 0) {
    throw new Error("user not found");
  }

  const user = userList[0];

  const decryptedPassword = decrypt(user.password);

  if (password !== decryptedPassword) {
    throw new Error("invalid password");
  }

  return sign({
    userId: user.userid,
    username: user.username,
    membership: user.membership,
  });
};

module.exports = {
  register,
  login,
};
