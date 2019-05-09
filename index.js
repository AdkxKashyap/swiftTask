const express=require('express')
require('./src/db/mongoose.js')
const users=require('./src/model/users')
const tasks=require('./src/model/tasks')
const userRoutes=require('./src/routes/users')
const tasksRoutes=require('./src/routes/tasks')


const app=express()
const port=process.env.PORT

// app.use((req,res,next)=>{
//     //This is a middleware.
//     res.status(503).send("Server under maintainance.Please come back later.")
// })
app.use(express.json())//parses incoming requests to json object
app.use(userRoutes)//to make a file and small we have moved the routes to a different folder
app.use(tasksRoutes)


// app.post('/tasks',async(req,res)=>{//USING router to keep this file simple
//     const task=new tasks(req.body)
//     try {
//         await task.save()
//         res.status(201).send(task)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })


app.listen(port,()=>{
    console.log("Server is running on port"+port)
})

