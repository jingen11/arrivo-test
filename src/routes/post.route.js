const express = require("express");
const { StatusCodes } = require("http-status-codes");

const {
  getPost,
  getPosts,
  sanitisePost,
} = require("../services/post/post.service");
const { errorResponse, dataResponse } = require("../utils/response.helper");
const { asyncWrapper } = require("../middleware");

const router = express.Router();

const postRoute = () => {
  router.get("/health", (req, res) => {
    return dataResponse(res, StatusCodes.OK, {
      health: true,
      path: "postRoute",
    });
  });

  router.get(
    "/:postId",
    asyncWrapper(async (req, res) => {
      try {
        const post = await getPost(req.params.postId, req.user.membership >= 1);

        dataResponse(res, StatusCodes.OK, {
          post: { ...sanitisePost(post) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.get(
    "/",
    asyncWrapper(async (req, res) => {
      try {
        const posts = await getPosts(req.user.membership >= 1);

        const sanitisedPosts = [];

        for (const post of posts) {
          sanitisedPosts.push(sanitisePost(post));
        }

        dataResponse(res, StatusCodes.OK, {
          posts: sanitisedPosts,
          count: sanitisedPosts.length,
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.post(
    "/",
    asyncWrapper(async (req, res) => {
      try {
        const post = await createPost(req.body.post);

        dataResponse(res, StatusCodes.CREATED, {
          post: { ...sanitisePost(post) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.put(
    "/:postId",
    asyncWrapper(async (req, res) => {
      try {
        const post = await updatePost(req.params.postId, req.body.post);

        dataResponse(res, StatusCodes.OK, {
          post: { ...sanitisePost(post) },
        });
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  router.delete(
    "/:postId",
    asyncWrapper(async (req, res) => {
      try {
        await deletePost(req.params.postId);

        dataResponse(res, StatusCodes.NO_CONTENT, {});
      } catch (error) {
        errorResponse(res, StatusCodes.BAD_REQUEST, error.message, error.stack);
      }
    })
  );

  return router;
};

module.exports = postRoute;
