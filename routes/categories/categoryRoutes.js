const express = require('express');
const { categoryCreateCtrl, categorySingleCtrl, categoryDeleteCtrl, categoryUpdateCtrl,fetchCategoriesCtrl } = require('../../controllers/categories/categoryCtrl');
const isLogin = require('../../middlewares/isLogin');

const categoryRouter = express.Router();

//POST/api/v1/categories
categoryRouter.post("/",isLogin,categoryCreateCtrl);

//POST/api/v1/categories
categoryRouter.get("/",fetchCategoriesCtrl);

//GET/api/v1/categories/:id
categoryRouter.get("/:id",categorySingleCtrl);


//DELETE/api/v1/categories/:id
categoryRouter.delete("/:id",isLogin,categoryDeleteCtrl);

//PUT/api/v1/categories/:id
categoryRouter.put("/:id",isLogin,categoryUpdateCtrl);

module.exports = categoryRouter;