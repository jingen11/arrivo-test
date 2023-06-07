const uuid = require("uuid");

const db = require("../db");

const createPost = async (post) => {
  if (!post) {
    throw new Error("no parameters found");
  }

  if (typeof post.title !== "string") {
    throw new Error("title must be string");
  }

  if (!post.title.trim()) {
    throw new Error("title cannot be empty");
  }

  if (typeof post.body !== "string") {
    throw new Error("body must be string");
  }

  if (!post.body.trim()) {
    throw new Error("body cannot be empty");
  }

  if (typeof post.categoryId !== "string") {
    throw new Error("categoryId must be string");
  }

  if (!post.categoryId.trim()) {
    throw new Error("categoryId cannot be empty");
  }

  const postId = uuid.v4();

  try {
    const insertedPost = await db.query(
      `WITH insertedPost AS(INSERT INTO "post"(postId, title, body, categoryId, status, label) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *)
      SELECT insertedPost.*, category.name AS c_name, category.description AS c_description, category.activated AS c_activated 
      FROM insertedPost 
      LEFT JOIN "category" AS category 
      ON insertedPost.categoryId = category.categoryId;`,
      [
        postId,
        post.title.trim(),
        post.body.trim(),
        post.categoryId.trim(),
        post.status !== 0 && post.status !== 1 && post.status !== 2
          ? 0
          : post.status,
        post.label !== 0 && post.label !== 1 ? 0 : post.label,
      ]
    );

    return insertedPost.rows[0];
  } catch (error) {
    if (
      error.message ===
      `insert or update on table "post" violates foreign key constraint "fkcategory"`
    )
      throw new Error("invalid categoryId");

    throw error;
  }
};

const getPost = async (postId, isPremium = false) => {
  if (typeof postId !== "string") {
    throw new Error("postId must be string");
  }

  if (typeof isPremium !== "boolean") {
    throw new Error("isPremium must be boolean");
  }

  const post = await db.select(
    `SELECT post.*, category.name AS c_name, category.description AS c_description, category.activated AS c_activated 
    FROM "post" AS post 
    LEFT JOIN "category" AS category 
    ON post.categoryId = category.categoryId 
    WHERE postId = $1 AND label <= $2;`,
    [postId, isPremium ? 1 : 0]
  );

  if (post.length === 0) {
    throw new Error("no posts found");
  }

  return post[0];
};

const getPosts = async (isPremium = false, start = 0, paginate = 50) => {
  return await db.select(
    `SELECT post.*, category.name AS c_name, category.description AS c_description, category.activated AS c_activated 
    FROM "post" AS post 
    LEFT JOIN "category" AS category 
    ON post.categoryId = category.categoryId 
    WHERE label <= $1
    OFFSET $2 LIMIT $3;`,
    [isPremium ? 1 : 0, start, paginate]
  );
};

const updatePost = async (postId, post) => {
  if (typeof postId !== "string") {
    throw new Error("postId must be string");
  }

  if (!post) {
    throw new Error("no parameters found");
  }

  if (post.title && typeof post.title !== "string") {
    throw new Error("title must be string");
  }

  if (post.body && typeof post.body !== "string") {
    throw new Error("body must be string");
  }

  if (post.categoryId && typeof post.categoryId !== "string") {
    throw new Error("categoryId must be string");
  }

  try {
    const updatedPost = await db.query(
      `WITH updatedPost AS(
        UPDATE "post" 
        SET 
          title = COALESCE($1, title), 
          body = COALESCE($2, body), 
          categoryId = COALESCE($3, categoryId), 
          status = COALESCE($4, status), 
          label = COALESCE($5, label), 
          updatedAt = $6 
        WHERE postId = $7 RETURNING *
      )
      SELECT updatedPost.*, category.name AS c_name, category.description AS c_description, category.activated AS c_activated 
      FROM updatedPost 
      LEFT JOIN "category" AS category 
      ON updatedPost.categoryId = category.categoryId;`,
      [
        !post.title || !post.title.trim() ? null : post.title.trim(),
        !post.body || !post.body.trim() ? null : post.body.trim(),
        !post.categoryId || !post.categoryId.trim()
          ? null
          : post.categoryId.trim(),
        post.status !== 0 && post.status !== 1 && post.status !== 2
          ? null
          : post.status,
        post.label !== 0 && post.label !== 1 ? null : post.label,
        new Date(),
        postId,
      ]
    );

    if (updatedPost.rows.length === 0) {
      throw new Error("no posts found");
    }

    return updatedPost.rows[0];
  } catch (error) {
    if (
      error.message ===
      `insert or update on table "post" violates foreign key constraint "fkcategory"`
    )
      throw new Error("invalid categoryId");

    throw error;
  }
};

const deletePost = async (postId) => {
  if (typeof postId !== "string") {
    throw new Error("postId must be string");
  }

  const count = await db.select(
    `SELECT COUNT(*) as count FROM "post" WHERE postId =$1`,
    [postId]
  );

  if (count[0].count === "0") {
    throw new Error(`post with id ${postId} does not exists`);
  }

  await db.query(`DELETE FROM "post" WHERE postId = $1;`, [postId]);
};

const sanitisePost = (post) => {
  return {
    postId: post.postid,
    title: post.title,
    body: post.body,
    category: {
      categoryId: post.categoryid,
      name: post.c_name,
      description: post.c_description,
      activated: post.c_activated,
    },
    status: post.status,
    label: post.label,
  };
};

module.exports = {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  sanitisePost,
};
