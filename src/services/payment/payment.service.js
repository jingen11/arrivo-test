const db = require("../db");
const network = require("../network");

const makePayment = async (details) => {
  if (!details) {
    throw new Error("no parameters found");
  }

  if (typeof details.description !== "string") {
    throw new Error("description must be string");
  }

  if (!details.description.trim()) {
    throw new Error("description cannot be empty");
  }

  if (typeof details.amount !== "number") {
    throw new Error("amount must be number");
  }

  if (typeof details.email !== "string") {
    throw new Error("email must be string");
  }

  if (!details.email.trim()) {
    throw new Error("email cannot be empty");
  }

  if (typeof details.name !== "string") {
    throw new Error("name must be string");
  }

  if (!details.name.trim()) {
    throw new Error("name cannot be empty");
  }

  const res = await network.post("/v3/bills", {
    collection_id: process.env.COLLECTION_ID,
    description: details.description.trim(),
    email: details.email.trim(),
    name: details.name.trim(),
    amount: details.amount,
    callback_url: process.env.BILLPLZ_CALLBACK_URL,
  });

  if (res.status >= 200 && res.status < 300) {
    const payment = await createPayment({
      paymentId: res.data.id,
      amount: res.data.amount,
      paymentMethod: "billplz",
      status: res.data.state,
    });

    return payment;
  } else {
    throw new Error(res.data.error.message);
  }
};

const createPayment = async (payment) => {
  if (!payment) {
    throw new Error("no parameters found");
  }

  if (typeof payment.paymentId !== "string") {
    throw new Error("paymentId must be string");
  }

  if (!payment.paymentId.trim()) {
    throw new Error("paymentId cannot be empty");
  }

  if (typeof payment.amount !== "number") {
    throw new Error("amount must be number");
  }

  if (typeof payment.paymentMethod !== "string") {
    throw new Error("paymentMethod must be string");
  }

  if (!payment.paymentMethod.trim()) {
    throw new Error("paymentMethod cannot be empty");
  }

  if (typeof payment.status !== "string") {
    throw new Error("status must be string");
  }

  if (!payment.status.trim()) {
    throw new Error("status cannot be empty");
  }

  const insertedPayment = await db.query(
    `INSERT INTO "payment"(paymentId, amount, paymentMethod, status) VALUES ($1, $2, $3, $4) RETURNING *;`,
    [
      payment.paymentId.trim(),
      payment.amount,
      payment.paymentMethod.trim(),
      payment.status.trim(),
    ]
  );

  return insertedPayment.rows[0];
};

const getPayment = async (paymentId) => {
  if (typeof paymentId !== "string") {
    throw new Error("paymentId must be string");
  }

  const payment = await db.select(
    `SELECT * FROM "payment" WHERE paymentId = $1;`,
    [paymentId]
  );

  if (payment.length === 0) {
    throw new Error("no payments found");
  }

  return payment[0];
};

const getPayments = async (start = 0, paginate = 50) => {
  return await db.select(`SELECT * FROM "payment" OFFSET $1 LIMIT $2;`, [
    start,
    paginate,
  ]);
};

const sanitisePayment = (payment) => {
  return {
    paymentId: payment.paymentid,
    amount: payment.amount,
    paymentMethod: payment.paymentmethod,
    status: payment.status,
  };
};

module.exports = {
  makePayment,
  createPayment,
  getPayment,
  getPayments,
  sanitisePayment,
};
