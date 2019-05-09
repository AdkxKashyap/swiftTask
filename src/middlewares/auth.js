const jwt=require('jsonwebtoken')
const User=require('../model/users')
const auth=async (req,res,next)=>{
    try {
        const token=req.header('Authorization').replace('Bearer ','')
        const decode=jwt.verify(token,process.env.JWT_SECRET)//we will get the id of user and based on that id we will exec a query
        const user=await User.findOne({_id:decode,'tokens.token':token})//we also nedd to check weathr the token exists as the user logs out the token will be deleted
        
        if(!user){
            throw new Error()
        }
        req.token=token//current token
        req.user=user
        next()
} catch (error) {
    res.status(401).send("Error:Authentication Failed")
}
    
}

module.exports=auth