const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
// function to connect

const dbConnect = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('DataBase is connected successfully');
    }catch(error){
        console.log(error.message);
        process.exit(1);
    }
}

dbConnect();