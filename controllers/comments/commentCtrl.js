const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const { appErr } = require("../../utils/appErr");

// Create comment
const commentCreateCtrl = async(req,res,next)=>{
    const {description} = req.body;
    try{
        //Find the post
        const post = await Post.findById(req.params.id);
        //Create comment
        const comment = await Comment.create({
            post:post._id,
            description,
            user:req.userAuth
        })
        console.log(comment);
        //Push the comment to post
        post.comments.push(comment._id);
        //Find the User
        const user = await User.findById(req.userAuth);
        //Push to user
        user.comments.push(comment._id);

        //save
        //Disable validation
        await post.save({validateBeforeSave:false});
        await user.save({validateBeforeSave:false});
        
        res.json({
            status:"success",
            data:comment
        });
    }catch(err){
       return next(appErr(err.message)); 
    }
}

// Single Comment
const commentSingleCtrl = async(req,res)=>{
    try{
        res.json({
            status:"success",
            data:"comment route" 
        });
    }catch(err){
        res.json(err.message); 
    }
}

// All comments
const commentsCtrl = async(req,res)=>{
    try{
        res.json({
            status:"success",
            data:"comments route" 
        });
    }catch(err){
        res.json(err.message); 
    }
};

// DELETE
const commentDeleteCtrl = async(req,res,next)=>{
    try{
        // Find the comment
        const comment = await Comment.findById(req.params.id);
        if(comment.user.toString() !== req.userAuth.toString()){
            return next(appErr('You are not allowed to delete the comments',403));
        }
        await Comment.findByIdAndDelete(req.params.id);
        res.json({
            status:"success",
            data:"Comment has been deleted successfully" 
        });
    }catch(err){
      return next(appErr(res.json(err.message))); 
    }
}

// UPDATE
const commentUpdateCtrl = async(req,res,next)=>{
    const {description} = req.body;
    try{
        // Find the comment
        const comment = await Comment.findById(req.params.id);
        if(comment.user.toString() !== req.userAuth.toString()){
            return next(appErr('You are not allowed to update the comments',403));
        }
        const category = await Comment.findByIdAndUpdate(
            req.params.id,
            {description},
            {new:true,runValidators:true}
            );
        res.json({
            status:"success",
            data:category
        });
    }catch(err){
        return next(appErr(err.message)); 
    }
}

module.exports = {
    commentCreateCtrl,
    commentSingleCtrl,
    commentsCtrl,
    commentDeleteCtrl,
    commentUpdateCtrl,
}