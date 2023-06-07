const uuid = require("uuid");

const db = require("../db");

const createCategory = async (category) => {
  if (!category) {
    throw new Error("no parameters found");
  }

  if (!category.name || !category.name.trim()) {
    throw new Error("name cannot be empty");
  }

  const categoryId = uuid.v4();

  const insertedCategory = await db.query(
    `INSERT INTO "category"(categoryId, name, description, activated) VALUES ($1, $2, $3, $4) RETURNING *;`,
    [
      categoryId,
      category.name.trim(),
      category.description,
      category.activated ?? false,
    ]
  );

  return insertedCategory.rows[0];
};

const getCategory = async (categoryId) => {
  return (
    await db.select(`SELECT * FROM "category" WHERE categoryId = $1;`, [
      categoryId,
    ])
  )[0];
};

const getCategories = async (start = 0, paginate = 50) => {
  return await db.select(`SELECT * FROM "category" OFFSET $1 LIMIT $2;`, [
    start,
    paginate,
  ]);
};

const updateCategory = async (categoryId, category) => {
  if (!category) {
    throw new Error("no parameters found");
  }

  const updatedCategory = await db.query(
    `UPDATE "category" SET name = COALESCE($1, name), description = COALESCE($2, description), activated = COALESCE($3, activated), updatedAt = $4 WHERE categoryId = $5 RETURNING *;`,
    [
      !category.name || !category.name.trim() ? null : category.name.trim(),
      !category.description || !category.description.trim()
        ? null
        : category.description.trim(),
      category.activated === true || category.activated === false
        ? category.activated
        : null,
      new Date(),
      categoryId,
    ]
  );

  if (updatedCategory.rows.length === 0) {
    throw new Error("no categories found");
  }

  return updatedCategory.rows[0];
};

const deleteCategory = async (categoryId) => {
  await db.query(`DELETE FROM "category" WHERE categoryId = $1;`, [categoryId]);
};

const sanitiseCategory = (category) => {
  return {
    categoryId: category.categoryid,
    name: category.name,
    description: category.description,
    activated: category.activated,
  };
};

module.exports = {
  createCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  sanitiseCategory,
};
