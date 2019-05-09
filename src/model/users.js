const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcrypt')
const Task=require('../model/tasks')
const jwt=require('jsonwebtoken')
//Moongoose internally converts a model to a schema.Here we are creating our own schema.Middlewares works on schema level
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        validate(value){
            if(value<0){
                throw new Error("Age is Invalid")
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error("Provide valid email")
            }
        },
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(val){
            if(val.includes("password")){
                throw new Error("Invalid")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        } 
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'tasks',
    localField:"_id",
    foreignField:"owner"
})
//remove tokens and passwords from displaying
//To Json method is a special method is MDN
//while userdata is sent to client it is strinified.when json.stringify method is called this method is automatically called.
userSchema.methods.toJSON=function(){
    const userObject=this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
//methods are accessed through objects.Since tokens belong to a specific user.
userSchema.methods.generateToken=async function(){
    const token=jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    this.tokens.push({token})//every time a user logs in a new token will get generated and pushed into the db
    await this.save()
    return token
}

//Statics are pretty much the same as methods but allow for defining functions that exist directly on your Model.
userSchema.statics.findByCredentials=async function(email,password){
    
        const findUser= await user.findOne({email})
        if(!findUser){
            throw new Error("Email not found.Login Failed!")
        }
        const isValidPassword=await bcrypt.compare(password,findUser.password)
        if(!isValidPassword){
            throw new Error('Invalid Password.Login Failed!')
        }
        return findUser 
}

userSchema.pre('save',async function(next){
    //This will run before save ops.Some ops like update bypass this middleware so we need to make some changes to it
    const user=this//refers to the schema
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})
userSchema.pre('remove',async function(next){
    await Task.deleteMany({owner:this._id})
    next()
})
const user=mongoose.model('User',userSchema)
    module.exports=user