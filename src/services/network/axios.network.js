const axios = require("axios");

let instance;

const init = (baseUrl, authorization) => {
  instance = axios.create({
    baseURL: baseUrl,
    headers: {
      "content-type": "application/json",
      Authorization: authorization,
    },
    timeout: 30000,
  });
};

const get = async (url, params, config) => {
  return await instance.get(url, {
    params: params,
    ...config,
  });
};

const post = async (url, data, config) => {
  try {
    console.log(data);
    return await instance.post(url, data, { ...config });
  } catch (error) {
    console.log(error.response);

    throw error;
  }
};

const put = async () => {
  return await instance.put(url, data, { ...config });
};

const del = async () => {
  return await instance.delete(url, { ...config });
};

module.exports = {
  init,
  get,
  post,
  put,
  del,
};
