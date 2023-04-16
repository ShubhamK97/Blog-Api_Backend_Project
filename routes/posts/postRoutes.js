
const express = require('express');
const multer = require('multer');
const storage = require('../../config/cloudinary');
const { postCreateCtrl, postSingleCtrl, fetchPostsCtrl, postUpdateCtrl, postDeleteCtrl,toggleLikesPostCtrl,toggleDisLikesPostCtrl } = require('../../controllers/posts/postCtrl');
const isLogin = require('../../middlewares/isLogin');


const postRouter = express.Router();

//File upload middleware
const upload = multer({storage});

//POST/api/v1/posts
postRouter.post("/",isLogin,upload.single('image'), postCreateCtrl);

//GET/api/v1/posts/:id
postRouter.get("/:id",isLogin,postSingleCtrl);

//GET/api/v1/posts
postRouter.get("/",isLogin,fetchPostsCtrl );

//PUT/api/v1/posts/:id
postRouter.put("/:id",isLogin,upload.single('image'),postUpdateCtrl);

//GET/api/v1/posts/like/:id
postRouter.get("/likes/:id",isLogin,toggleLikesPostCtrl);

//GET/api/v1/posts/dislikes/:id
postRouter.get("/dislikes/:id",isLogin,toggleDisLikesPostCtrl);

//DELETE/api/v1/posts/:id
postRouter.delete("/:id",isLogin,postDeleteCtrl);

module.exports = postRouter;