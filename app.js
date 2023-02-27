const express = require('express');
const app =express()
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./routes/userRoutes')



dotenv.config()

app.use(userRoutes)

const mongoose = require('mongoose')
mongoose.set("strictQuery",true)
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("db connectiion successfully")
})



const port = process.env.PORT
app.listen(port,()=>{
    console.log(`server is running successfully on : http://localhost:${port}`)
})