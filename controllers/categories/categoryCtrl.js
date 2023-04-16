const Category = require("../../model/Category/Category");
const { appErr } = require("../../utils/appErr");

// Create
const categoryCreateCtrl = async(req,res,next)=>{
    const {title} = req.body;
    try{
        const category = await Category.create({title,user:req.userAuth})
        res.json({
            status:"success",
            data:category
        });
    }catch(err){
        return next(appErr(err.message)); 
    }
}

//all categories
const fetchCategoriesCtrl = async(req,res,next)=>{
    try{
        const categories = await Category.find();
        res.json({
            status:"success",
            data:categories
        });
    }catch(err){
        return next(appErr(err.message)); 
    }
}

//Single
const categorySingleCtrl = async(req,res,next)=>{
    try{
        const category = await Category.findById(req.params.id);
        res.json({
            status:"success",
            data:category
        });
    }catch(err){
        return next(appErr(err.message)); 
    }
}

//DELETE
const categoryDeleteCtrl = async(req,res,next)=>{
    try{
     await Category.findByIdAndDelete(req.params.id);
        res.json({
            status:"success",
            data:"Deleted category successfully" 
        });
    }catch(err){
        return next(appErr(err.message)); 
    }
}

// Update
const categoryUpdateCtrl = async(req,res,next)=>{
    const {title} = req.body;
    try{
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {title},
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
    categoryCreateCtrl,
    categorySingleCtrl,
    categoryDeleteCtrl,
    categoryUpdateCtrl,
    fetchCategoriesCtrl
}