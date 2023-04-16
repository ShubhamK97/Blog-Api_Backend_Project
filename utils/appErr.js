// App err

const appErr = (message,statusCode)=>{
    let error = new Error(message); // since this is an instant object we can add properties with it.
    error.statusCode = statusCode ? statusCode : 500;
    error.stack = error.stack;
    return error;
}

//2nd method
//Err Class
class AppErr extends Error {
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = 'failed';
    }

}

module.exports = {appErr,AppErr};