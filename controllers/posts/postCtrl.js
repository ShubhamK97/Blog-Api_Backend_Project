const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const { appErr } = require("../../utils/appErr");


//Create
const postCreateCtrl = async(req,res,next)=>{
    //console.log(req.file);
   const {title,description,category} = req.body;
    try{
        //Find the user
        
        const author = await User.findById(req.userAuth);
        //Check if the user is blocked
        //console.log('author = ',author);
        //console.log('author.isBlocked = ',author.isBlocked);
        if(author.isBlocked){
            return next(appErr('Access denied, Account blocked',403));
        }
        //Create the post
        const postCreated = await Post.create({
            title,
            description,
            user:req.userAuth,
            category,
            photo:req?.file?.path
        })
        //Associate user to a POst -Push the post into user posts field
        author.posts.push(postCreated);
        //save
        await author.save(); 
        res.json({
            status:"success",
            data:postCreated
        });
    }catch(err){
        next(appErr(err.message));
    }
}

//ToggleLikes
const toggleLikesPostCtrl =  async(req,res,next)=>{
    try{
        //1. Get the post
        const post = await Post.findById(req.params.id);
        //2. check if the user has liked the post already
        const isLiked = post.likes.includes(req.userAuth);
        //3. If the user has alreasdy likes the post, unlike the post
        if(isLiked){
            post.likes = post.likes.filter(like => like.toString() !== req.userAuth.toString());
            await post.save();
        }else{
            //4. If the user has not liked the post, like the post
            post.likes.push(req.userAuth);
            await post.save();
        }
        res.json({
            status:"success",
            data:post
        });
    }catch(err){
        next(appErr(err.message));
    }
}

//ToggleDisLikes
const toggleDisLikesPostCtrl =  async(req,res,next)=>{
    try{
        //1. Get the post
        const post = await Post.findById(req.params.id);
        //2. check if the user has liked the post already
        const isUnliked = post.disLikes.includes(req.userAuth);
        //3. If the user has already unlikes the post, unlike the post
        if(isUnliked){
            post.disLikes = post.disLikes.filter(dislike => dislike.toString() !== req.userAuth.toString());
            await post.save();
        }else{
            //4. If the user has not liked the post, like the post
            post.disLikes.push(req.userAuth);
            await post.save();
        }
        res.json({
            status:"success",
            data:post
        });
    }catch(err){
        next(appErr(err.message));
    }
}

//Single
const postSingleCtrl =  async(req,res,next)=>{
    try{
        //1. find the post
        const post = await Post.findById(req.params.id);
        //Number of views
        //check if user view this post
        const isViewed = post.numViews.includes(req.userAuth);
        if(isViewed){
            res.json({
                status:"success",
                data:post 
            });
        }else{
            // put the user into numOfViews
            post.numViews.push(req.userAuth);
            //save
            await post.save();
            res.json({
                status:"success",
                data:post 
            });
        }
        
    }catch(err){
        next(appErr(err.message));
    }
}


// Get all posts
const fetchPostsCtrl = async(req,res,next)=>{
    try{
        // Find all posts
        const posts = await Post.find({}).populate('user').populate('category','title');

        //check if the user is blocked by the post owner
        const filteredPosts = posts.filter(post=>{
            //get all blocked users
            const blockedUsers = post.user.blocked;
            const isBlocked = blockedUsers.includes(req.userAuth);
            //return isBlocked ? null : posts;
            return !isBlocked;
        })
        res.json({
            status:"success",
            data:posts 
        });
    }catch(err){
        next(appErr(err.message));
    }
}

//Update
const postUpdateCtrl =  async(req,res,next)=>{
    const {title,description,category} = req.body
    try{
        //Find the post
        const post = await Post.findById(req.params.id);
        if(post.user.toString() !== req.userAuth.toString()){
            return next(appErr('You are not allowed to update this post',403));
        }
        await Post.findByIdAndUpdate(req.params.id,{
            title,
            description,
            category,
            photo:req?.file?.path,
        },{
            new:true
        });
        res.json({
            status:"success",
            data:"Post updated successfully" 
        });
    }catch(err){
        next(appErr(err.message));
    }
}

// Delete
const postDeleteCtrl =  async(req,res,next)=>{
    try{
        //Find the post
        const post = await Post.findById(req.params.id);
        if(post.user.toString() !== req.userAuth.toString()){
            return next(appErr('You are not allowed to delete this post',403));
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({
            status:"success",
            data:"Post deleted successfully" 
        });
    }catch(err){
        next(appErr(err.message));
    }
}

module.exports ={
    postCreateCtrl,
    postSingleCtrl,
    fetchPostsCtrl,
    postUpdateCtrl,
    postDeleteCtrl,
    toggleLikesPostCtrl,
    toggleDisLikesPostCtrl
}
