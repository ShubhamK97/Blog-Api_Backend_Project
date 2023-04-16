const bcrypt = require('bcryptjs');
const storage = require('../../config/cloudinary');
const User = require('../../model/User/User');
const {appErr,AppErr} = require('../../utils/appErr');
const generateToken = require('../../utils/generateToken');
const getTokenFromHeader = require('../../utils/getTokenFromHeader');
const multer = require('multer');
const Comment = require('../../model/Comment/Comment');
const Category = require('../../model/Category/Category');
const Post = require('../../model/Post/Post');

//Register (Business logic)
const userRegisterCtrl = async(req,res,next)=>{
    const {firstName,lastName,email,password} = req.body;
    try{
        // Check if email exist
        const userFound = await User.findOne({email});
        if(userFound){
            return next(appErr("User Already Exist", 500));
        }
        
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        // create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword
        })
        res.json({
            status:"success",
            data:user
        });
    }catch(err){
        next(appErr(err.message)); 
    }
}

//Login
const userLoginCtrl = async(req,res,next)=>{
    const {email,password} = req.body
    try{
        // check if email exist
        const userFound = await User.findOne({email});
        if(!userFound){
            return next(appErr('invalid email or password'));
        }
        // verify password
        const isPasswordMatched = await bcrypt.compare(password,userFound.password);

        if( !isPasswordMatched){
            return next(appErr('invalid email or password'));
        }
        res.json({
            status:"success",
            data:{
                firstName:userFound.firstName,
                lastName:userFound.lastName,
                email:userFound.email,
                isAdmin:userFound.isAdmin,
                token:generateToken(userFound._id)
            }
        });
    }catch(err){
       next(appErr(err.message)); 
    }
}

// Get user Profile
const userProfileCtrl = async(req,res,next)=>{
    try{
        const user = await User.findById(req.userAuth)
        res.json({
            status:"success",
            data:user 
        });
    }catch(err){
        next(appErr(err.message)); 
    }
}

// who view my profile
const whoViewedMyProfileCtrl = async(req,res,next)=>{
    try{
        //1. Find the original
        const user = await User.findById(req.params.id);

        //2. Find the user who viewed the original user
        const userWhoViewed = await User.findById(req.userAuth);

        //3. check if original and who viewed are found
        if(user && userWhoViewed){
            //4. check if userWhoViewed is already in the user viweres array
            const isUserAlreadyViewed = user.viewers.find(
                viewer => viewer.toString() === userWhoViewed._id.toJSON()
            );
            if(isUserAlreadyViewed){
                return next(appErr('You already viewed this profile'))
            }else{
                //5. Push the userWhoViewed in the user's viewers array
                user.viewers.push(userWhoViewed._id);
                //6. save the user
                await user.save();
                res.json({
                    status:"success",
                    data:"You have successfully viewed the profile" 
                });
            }
        }       
    }catch(err){
        next(appErr(err.message)); 
    }
}

// Following
const followingCtrl = async(req,res,next)=>{
    try{
        //1. find the user to follow
        const userToFollow = await User.findById(req.params.id);
        //2. find the user who is following
        const userWhoFollowed = await User.findById(req.userAuth);

        //3. check if userToFollow && usrWhoFollowed are found
        if(userToFollow && userWhoFollowed){
            //4. check if userWhoFollowed is already in user's follower's array
            const isUserAlreadyFollowed = userToFollow.following.find(
                follower=>follower.toString() === userWhoFollowed._id.toString()
            );
            if(isUserAlreadyFollowed){
                return next(appErr('You already followed this user'));
            }else{
                //5. push userWhoFollowed into the user's followers array
                userToFollow.followers.push(userWhoFollowed._id);
                //6. push userToFollow to the userWhoFollowed's following array
                userWhoFollowed.following.push(userToFollow._id);

                //save
                await userWhoFollowed.save();
                await userToFollow.save();
                res.json({
                    status:"success",
                    data:"You have successfully Follow this user" 
                });
            }
        }
        
    }catch(err){
        res.json(err.message); 
    }
}


// All users
const usersCtrl = async(req,res)=>{
    try{
        const users = await User.find();
        res.json({
            status:"success",
            data:users, 
        });
    }catch(err){
        next(appErr(err.message));
    }
}

// unFollow
const unFollowCtrl = async(req,res,next)=>{
    try{
        //1. find the user to unfollow
        const userToUnfollowed = await User.findById(req.params.id);
        //2. find the user who is unfollowing
        const userWhoUnfollowed = await User.findById(req.userAuth);
        console.log(userToUnfollowed);
        console.log(userWhoUnfollowed);
        //3. check if userWhoUnfollowed is already in the user's follower's array
        if(userToUnfollowed && userWhoUnfollowed ){
        const isUserAlreadyFollowed = userToUnfollowed.followers.find(
            follower => follower.toString() === userWhoUnfollowed._id.toString()
        );
        if(!isUserAlreadyFollowed){
            return next(appErr('You have not followed this user'))
        }else{
             //5. Remove userWhoUnFollowed from the user's followers array
             userToUnfollowed.followers = userToUnfollowed.followers.filter(
                follower=>follower.toString() !== userWhoUnfollowed._id.toString()
             );
             // save the user
             await userToUnfollowed.save();
             //7. Remove userToUnfollowed from the userWhoUnfollowed's following array
             userWhoUnfollowed.following = userWhoUnfollowed.following.filter(
                following => following.toString() !== userToUnfollowed._id.toString()
             );
             //8. save the user
             await userWhoUnfollowed.save();
             res.json({
                status:"success",
                data:"You have successfully unfollow this user" 
            });       
        }
    } 
    }catch(err){
        next(appErr(err.message));
    }
}

// Block users
const blockUsersCtrl = async(req,res,next)=>{
    try{
        //1. Find the user to be blocked
        const userToBeBlocked = await User.findById(req.params.id);
        //2. find the user who is blocking
        const userWhoBlocked = await User.findById(req.userAuth);

        //3. check if userToBeBlocked and userWhoBlocked found
        console.log(userToBeBlocked);
        console.log(userWhoBlocked);
        if(userWhoBlocked && userToBeBlocked){
            //4. Check if userWhoBlocked is already in the user's block array
            const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
                blocked => blocked.toString() === userToBeBlocked._id.toString()
            );
            if(isUserAlreadyBlocked){
                return next(appErr('You already blocked this user'));
            }
            //7. Push userToBeBlocked to the userWhoBlocked's blocked arrray
            userWhoBlocked.blocked.push(userToBeBlocked._id);
            //8. save
            await userWhoBlocked.save();
            res.json({
                status:"success",
                data:"You have successfully blocked this user", 
            });
        }  
    }catch(err){
        next(appErr(err.message));
    }
}

// Unblock users
const unBlockUsersCtrl = async(req,res,next)=>{
    try{
        //1. Find the user to be Unblocked
        const userToBeUnBlocked = await User.findById(req.params.id);
        //2. find the user who is Unblocking
        const userWhoUnBlocked = await User.findById(req.userAuth);

        //3. check if userToBeUnBlocked and userWhoUnBlocked found
        if(userToBeUnBlocked && userWhoUnBlocked){
            //4. Check if userWhoUnBlocked is already in the user's block array
            const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(
                blocked => blocked.toString() === userToBeUnBlocked._id.toString()
            );
            if(!isUserAlreadyBlocked){
                return next(appErr('You have not blocked this user'));
            }
            //7. Push userToBeUnBlocked to the userWhoUnBlocked's blocked arrray
            userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
                blocked => blocked.toString() !== userToBeUnBlocked._id.toString()
                );
            //8. save
            await userWhoUnBlocked.save();
            res.json({
                status:"success",
                data:"You have successfully unblocked this user", 
            });
        }  
    }catch(err){
        next(appErr(err.message));
    }
}

// admin-block
const adminBlockCtrl = async(req,res,next)=>{
    try{
        //1. Find the user to be blocked
        const userToBeBlocked = await User.findById(req.params.id);
        //2. check if user is found
        if(!userToBeBlocked){
            return next(appErr('User not found'));
        }
        //3. change the isBlocked to true
        userToBeBlocked.isBlocked=true;
        //4. save
        await userToBeBlocked.save();  
        res.json({
            status:"success",
            data:"You have successfully blocked this user" 
        });
    }catch(err){
        next(appErr(err.message));
    }
}

// admin-unblock
const adminUnblockCtrl = async(req,res,next)=>{
    try{
        //1. Find the user to be blocked
        const userToBeUnblocked = await User.findById(req.params.id);
        //2. check if user is found
        if(!userToBeUnblocked){
            return next(appErr('User not found'));
        }
        //3. change the isBlocked to true
        userToBeUnblocked.isBlocked=false;
        //4. save
        await userToBeUnblocked.save();  
        res.json({
            status:"success",
            data:"You have successfully Unblocked this user" 
        });
    }catch(err){
        next(appErr(err.message)); 
    }
}



//Update user
const userUpdateCtrl = async(req,res,next)=>{
    const {email,lastName,firstName} = req.body
    try{
        //check if email is not taken
        if(email){
            const emailTaken = await User.findOne({email});
            if(emailTaken){
                return next(appErr('Email is already used',400));
            }
        }
        // update the user
        const user = await User.findByIdAndUpdate(req.userAuth,{
            lastName,
            firstName,
            email
        },{
            new:true,
            runValidators:true
        })
    //  send response
        res.json({
            status:"success",
            data:user 
        });
    }catch(err){
        res.json(err.message); 
    }
}

//Update user password
const updatePasswordCtrl = async(req,res,next)=>{
    const {password} = req.body
    try{
        //check if user is updating the password
       if(password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        //update user
        const user = await User.findByIdAndUpdate(
            req.userAuth,
            {password:hashedPassword},
            {
                new:true,
                runValidators:true
            }
        );
        res.json({
            status:"success",
            data:"password updated successfully" 
        })
       }else{
        return next(appErr('Please provide the password'));
       } 
        
    }catch(err){
        res.json(err.message); 
    }
}

//Delete user account
const deleteUserAccountCtrl = async(req,res,next)=>{
        try{
        //1. Find the user to be deleted
        const userToDelete = await User.findById(req.userAuth);
        //2. find all posts to be deleted
        await Post.deleteMany({user:req.userAuth});
        //3. Delete all comments of the user
        await Comment.deleteMany({user:req.userAuth});
        //4. Delete all category of the User
        await Category.deleteMany({user:req.userAuth});
        //5. Delete account
        await userToDelete.delete();
        //send response
        return res.json({
            status:'success',
            data:'Your account has been deleted successfully'
        });
    }catch(err){
        next(appErr(err.message));
    }
}

//Profile Photo Upload
const profilePhotoUploadCtrl = async(req,res,next)=>{
     //console.log(req.file);
    try{
        //1. Find the user to be Updated
        const userToUpdate = await User.findById(req.userAuth);
        //2. check if user is found
        if(!userToUpdate){
            return next(appErr('User not found',403));
        }
        //3. check if user is blocked
        if(userToUpdate.isBlocked){
            return next(appErr('Acton not allowed, Your account has been blocked',403));
        }
        //4. check if a user is updating there photo
        if(req.file){
        //5. update profile photo
            await User.findByIdAndUpdate(req.userAuth, 
                {
                    $set:{
                        profilePhoto:req.file.path,
                    },
                },
                {
                    new:true,
                }
            );
            res.json({
                status:"success",
                data:"You have successfully updated your Profile Photo",
            });
        }    
    }catch(err){
       return  next(appErr(err.message,500)); 
    }
}

module.exports = {
    userRegisterCtrl,
    userLoginCtrl,
    userProfileCtrl,
    usersCtrl,
    userUpdateCtrl,
    profilePhotoUploadCtrl,
    whoViewedMyProfileCtrl,
    followingCtrl,
    unFollowCtrl,
    blockUsersCtrl,
    unBlockUsersCtrl,
    adminBlockCtrl,
    adminUnblockCtrl,
    updatePasswordCtrl,
    deleteUserAccountCtrl
}