const crypto = require("crypto-js");

const charactersPool =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const numbersPool = "0123456789";

/**
 * @param {String} key
 * @returns {String}
 */
const encrypt = (key) => {
  return crypto.AES.encrypt(key, process.env.CRYPTO_HASH_KEY).toString();
};

/**
 * @param {String} key
 * @returns {String}
 */
const encryptChars = (key) => {
  let hash = crypto.AES.encrypt(key, process.env.CRYPTO_HASH_KEY).toString();

  hash = hash.replaceAll("+", "-");
  hash = hash.replaceAll("/", "_");
  hash = hash.replaceAll("=", "");

  return hash;
};

/**
 * @param {String} hashedKey
 * @returns {String}
 */
const decrypt = (hashedKey) => {
  const bytes = crypto.AES.decrypt(hashedKey, process.env.CRYPTO_HASH_KEY);
  return bytes.toString(crypto.enc.Utf8);
};

/**
 * @param {String} hashedKey
 * @returns {String}
 */
const decryptChars = (hashedKey) => {
  let properFormattedKey = hashedKey;
  properFormattedKey = properFormattedKey.replaceAll("-", "+");
  properFormattedKey = properFormattedKey.replaceAll("_", "/");

  while (properFormattedKey.length % 4 !== 0) {
    properFormattedKey += "=";
  }

  const bytes = crypto.AES.decrypt(
    properFormattedKey,
    process.env.CRYPTO_HASH_KEY
  );

  return bytes.toString(crypto.enc.Utf8);
};

/**
 * @param {Number} length
 * @returns {String}
 */
const randomCharacters = (length) => {
  let result = "";

  for (let i = 0; i < length; ++i)
    result += charactersPool.charAt(
      Math.floor(Math.random() * charactersPool.length)
    );

  return result;
};

/**
 * @param {Number} length
 * @returns {String}
 */
const randomNumbers = (length) => {
  let result = "";

  for (let i = 0; i < length; ++i)
    result += numbersPool.charAt(
      Math.floor(Math.random() * numbersPool.length)
    );

  return result;
};

module.exports = {
  encrypt,
  encryptChars,
  decrypt,
  decryptChars,
  randomCharacters,
  randomNumbers,
};
