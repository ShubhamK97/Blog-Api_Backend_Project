const globalErrHandler = (err,req,res,next)=>{
    //status
    //message
    //stack trace
    const status = err.status ? err.status : "failed";
    const message = err.message;
    const stack = err.stack;
    const statusCode = err?.statusCode ? err.statusCode : 500;
    //send the response
    res.status(statusCode).json({
        message,
        stack,
        status
    });

}

module.exports = globalErrHandler;