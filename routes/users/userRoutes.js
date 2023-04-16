const express = require('express');
require('dotenv').config();
const {userRegisterCtrl, userLoginCtrl, userProfileCtrl, usersCtrl, userUpdateCtrl, profilePhotoUploadCtrl,whoViewedMyProfileCtrl,followingCtrl,unFollowCtrl,blockUsersCtrl,unBlockUsersCtrl,adminBlockCtrl,adminUnblockCtrl,updatePasswordCtrl,deleteUserAccountCtrl} = require('../../controllers/users/userCtrl');

const userRouter = express.Router();

const isLogin = require('../../middlewares/isLogin');
const multer = require('multer');
const storage = require('../../config/cloudinary');
const getTokenFromHeader = require('../../utils/getTokenFromHeader');
const isAdmin = require('../../middlewares/isAdmin');

//Instance of multer
const upload = multer({storage}); 

//POST/api/v1/users/register
userRouter.post("/register", userRegisterCtrl);

//POST/api/v1/users/login
userRouter.post('/login',userLoginCtrl );

//GET/api/v1/users/profile/:id
userRouter.get('/profile/:id',isLogin,userProfileCtrl);

//GET/api/v1/users
userRouter.get('/',usersCtrl);


//PUT/api/v1/users/:id
userRouter.put('/',isLogin,userUpdateCtrl);

//POST/api/v1/users/profile-photo-upload
userRouter.post('/profile-photo-upload',
isLogin,
upload.single('profile'),
profilePhotoUploadCtrl);


//GET/api/v1/users/profile-viewers/:id
userRouter.get('/profile-viewers/:id',isLogin,whoViewedMyProfileCtrl);

//GET/api/v1/users/following/:id
userRouter.get('/following/:id',isLogin,followingCtrl);

//GET/api/v1/users/unfollow/:id
userRouter.get('/unfollow/:id',isLogin,unFollowCtrl);

//GET/api/v1/users/block/:id
userRouter.get('/block/:id',isLogin,blockUsersCtrl);


//GET/api/v1/users/unblock/:id
userRouter.get('/unblock/:id',isLogin,unBlockUsersCtrl);

//PUT/api/v1/users/admin-block/:id
userRouter.put('/admin-block/:id',isLogin,isAdmin,adminBlockCtrl);

//PUT/api/v1/users/admin-unblock/:id
userRouter.put('/admin-unblock/:id',isLogin,isAdmin,adminUnblockCtrl);


//DELETE/delete-account
userRouter.delete('/delete-account',isLogin,deleteUserAccountCtrl);

//PUT/api/v1/users/update-password
userRouter.put('/update-password',isLogin,updatePasswordCtrl);

module.exports = userRouter;