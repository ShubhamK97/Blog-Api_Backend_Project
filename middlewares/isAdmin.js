const User = require("../model/User/User");
const { appErr } = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isAdmin= async (req,res,next)=>{
    // get token from header
    const token = getTokenFromHeader(req);
    // verify the token
    const decodedUser = verifyToken(token)
    //save the user into req obj
    req.userAuth = decodedUser.id;

    console.log(decodedUser.id)

    //Find the user in DB
    const user = await User.findById(decodedUser.id);
    //console.log(user);
    // check if Admin
    console.log(user.isAdmin);
    if(user.isAdmin){
        console.log('1. Shubham');
        return next();
    }else{
        console.log('shubham');
        return next(appErr('Access Denied, Admin Only ',403))
    }
}

module.exports = isAdmin;