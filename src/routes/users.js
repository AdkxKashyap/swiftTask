
const express=require('express')
const router=new express.Router()
const users=require('../model/users')
const multer=require('multer')
const {sendWelcomeMsg}=require('../emails/welcomeMail')
const {sendCancellationMsg}=require('../emails/cancellationMail')
const auth=require('../middlewares/auth')


router.post('/users',async(req,res)=>{ //await is used only inside an await function
    const user=new users(req.body)
    
    try {
        await user.save()
      sendWelcomeMsg(user.name,user.email)
        const token= await user.generateToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(500).send(error.message)
    }
    
    // user.save().then(()=>{
    //     res.status(200)
    //     res.send(user)
    // }).catch((err)=>{
    //     res.status(400)
    //     res.send(err)
    // })
})

router.post('/users/login',async (req,res)=>{
    try {
        const user=await users.findByCredentials(req.body.email,req.body.password)
        const token= await user.generateToken()
        res.status(200).send({user,token})
    } catch (error) {
        res.status(400).send(error+"")
    }
})
//see our own profile
router.get('/users/me',auth,async(req,res)=>{
    res.status(200).send(req.user)
})
//NOT REQUIRED
// router.get('/users/:id',async(req,res)=>{
//     const _id=req.params.id
//     try {
//         const user=await users.findById(_id)
//         if(!user){
//             return res.status(400).send("User Not Found")
//         }
//          res.status(200).send(user)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })
//Delete MY account
router.delete('/users/me',auth,async(req,res)=>{
    try {
        req.user.remove()//used to remove the entire document.We can use remove or deleteMany({}).Alon with the user we also need to delete the tasks.We have used middlewares.see model class
        sendCancellationMsg(req.user.name,req.user.email)
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.patch('/users/me',auth,async(req,res)=>{
    const updates=Object.keys(req.body)//returns array of object keys
    const allowedUpdates=['name','age','email','password']
    const isValidUpdate=updates.every((update)=>allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send("Invalid update")
    }
    try {
        const user= req.user 
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

const uploadAvatar=multer({
    // dest:'images/avatar', image will be stored in db
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error("Invalid file extension"))
        }
        cb(undefined,true)

    }
})


router.post('/upload/me/avatar',auth,uploadAvatar.single('avatar'),async (req,res)=>{
    req.user.avatar=req.file.buffer
    await req.user.save()
    res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({"error":error.message})
})

router.delete('/upload/me/avatar',auth,async (req,res)=>{
    req.user.avatar=""
    await req.user.save()
    res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({"error":error.message})
})
module.exports=router