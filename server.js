const express = require('express');
const app = express();
const userRouter = require('./routes/users/userRoutes');
const postRouter = require('./routes/posts/postRoutes');
const isAdmin = require('./middlewares/isAdmin');
const commentRouter = require('./routes/comments/commentRoutes');
const categoryRouter = require('./routes/categories/categoryRoutes');
const dotenv = require('dotenv');
const globalErrHandler = require('./middlewares/globalErrHandler');

dotenv.config();
require('./config/dbConnect'); 
//console.log(app);

//middleware

app.use(express.json()); // pass incoming payload

//app.use(isAdmin);

//routes
//-------
// users route
app.use("/api/v1/users/", userRouter);

// posts routes
app.use('/api/v1/posts',postRouter);

// comments routes
app.use('/api/v1/comments',commentRouter);

// categories routes
app.use('/api/v1/categories',categoryRouter);

//Error handlers middlewares
app.use(globalErrHandler);

//404 error
app.use('*',(req,res)=>{
    console.log(req.originalUrl);
    res.status(404).json({
        message:` ${req.originalUrl} -Route Not Found`,
    });
});

//Listen to server

const PORT = process.env.port || 9000

app.listen(PORT,console.log(`Server is running on PORT ${PORT}`));
