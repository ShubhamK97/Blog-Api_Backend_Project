const mongoose = require('mongoose');
const Post = require('../Post/Post');

// create schema

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,"First Name is required"]
    },
    lastName:{
        type:String,
        required:[true,"Last Name is required"]
    },
    profilePhoto:{
        type:String
    },
    email:{
        type:String,
        required:[true,"Email is required"]
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    // postCount:{
    //     type:Number,
    //     default:0
    // },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:String,
        default:false
    },
    role:{
        type:String,
        enum:['Admin','Guest','Editor']
    },
    viewers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    // active:{
    //     type:Boolean,
    //     default:true
    // },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Post'
        }
    ],
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Comment'
        }
    ],
    blocked:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User' 
        }
    ],
    // plan:
    //     {
    //         type:String,
    //         enum:['Free','Premium','Pro'],
    //         default:'Free'
    //     },
    userAward:{
        type:String,
        enum:['Bronze','Silver','Gold'],
        default:'Bronze'
    }
},
{
    timestamps:true,
    toJSON:{virtuals:true},
}
);

//HOOKS
//pre-before record is saved
userSchema.pre("findOne",async function(next){
    //Populate the post
    this.populate({
        path:'posts',
    });
    // get user id
    const userId = this._conditions._id;
    //find all post created by user
    const posts = await Post.find({user:userId});
    //get the last post created by user
    const lastPost = posts[posts.length-1];
   // console.log(lastPost);
    // get last post date
    const lastPostDate = new Date(lastPost ?.createdAt); //optional chaining
    //console.log(lastPostDate);
    // get the last post date in string
    const lastPostDateStr = lastPostDate.toString(); // convert to IST
    
    userSchema.virtual('lastPostDate').get(function(){  
        return lastPostDateStr;    
    });
    //console.log(this);
    
    //-----------Check if user is inactive for 30days------------------------------
    
    //get current date
    const currentDate = new Date();
    
    //get the difference between the currentDate and last post date
    const diff = currentDate - lastPostDate;

    //get the difference in days and return less than in days
    const diffInDays = diff/(1000 * 3600 * 24); 
    
    //console.log(diffInDays);    
    
    if(diffInDays > 30){
        //Add virtuals inActive in schema to check if a user is inActive for 30 days
        userSchema.virtual('isActive').get(function(){
            return false;
        });
        //Find the user by ID and update
        await User.findByIdAndUpdate(
            userId,
            {
                isBlocked:true,
            },
            {
                new:true
            }
        );
    }else{
        //Add virtuals inActive in schema to check if a user is inActive for 30 days
        userSchema.virtual('isActive').get(function(){
            return true;
        });
        //Find the user by ID and update
        await User.findByIdAndUpdate(
            userId,
            {
                isBlocked:false,
            },
            {
                new:true
            }
        );
    }

    // Last Active Days
    //convert to days ago, for example 1 days ago
    const daysAgo = Math.floor(diffInDays);
    //add virtuals lastActive in days to the schema
    userSchema.virtual('lastActive').get(function(){
        if(daysAgo <= 0 )
        return 'Today';
        if(daysAgo == 1)
        return 'Yesterday';
        if(daysAgo > 1)
        return `${daysAgo} days ago`
    });

    //--------------------------------------------------------------------------------------------
    // Update userAwards based on the number of posts
    //--------------------------------------------------------------------------------------------
    //get the number of posts
    const numberOfPosts = posts.length;
    //check if the number of posts less then 10
    if(numberOfPosts <= 10)
    {
        await User.findByIdAndUpdate(userId,
            {
                userAward:'Bronze',
            },
            {
                new:true,
            }
            );
    }

     //check if the number of posts greater then 10 but less then equals to 20 
     if(numberOfPosts > 10 && numberOfPosts <= 20)
     {
         await User.findByIdAndUpdate(userId,
             {
                 userAward:'Silver',
             },
             {
                 new:true,
             }
             );
     }
      //check if the number of posts greater then 20
    if(numberOfPosts > 20)
    {
        await User.findByIdAndUpdate(userId,
            {
                userAward:'Gold',
            },
            {
                new:true,
            }
            );
    }
    next();
})

//post -after record is saved
userSchema.post("save",function(next){
    console.log("post hook")
});

//Get FullName
userSchema.virtual('fullname').get(function(){
    return `${this.firstName} ${this.lastName}`;
});

//Get user initials
userSchema.virtual('initials').get(function(){
    return `${this.firstName[0]}${this.lastName[0]}`;
});

//Get post count
userSchema.virtual('postCounts').get(function(){  
    return this.posts.length;    // used to count es user ne kitne post kiye
});

//Get post count
userSchema.virtual('followersCount').get(function(){  
    return this.followers.length;    // used to count es user ke followers p
});

//Get post count
userSchema.virtual('followingCount').get(function(){  
    return this.following.length;    
});

//Get post count
userSchema.virtual('blockedCount').get(function(){  
    return this.blocked.length;    
});

//Get post count
userSchema.virtual('viewersCount').get(function(){  
    return this.viewers.length;    // used to count es user ne kitne viewers hai
});

// compile the User Model
const User = mongoose.model('User',userSchema);

module.exports = User;