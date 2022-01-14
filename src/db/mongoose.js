
const mongoose=require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,//old parser is depricated
    useCreateIndex:true//to allow moongose to create indexes in mongodb 
}).then(()=>{
    console.log("Successfully COnnected to DB")
})





