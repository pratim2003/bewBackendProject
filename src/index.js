import dotenv from "dotenv"
import connect from './db/index.js'
import express from "express"

const app = express()

dotenv.config({
    path : "./env"
})
connect().then(()=>{
    app.on("error",(error)=>{
        console.log(error)
    })
    app.listen(process.env.port,()=>console.log(`port starting on ${process.env.port}`))
}).catch((error)=>{
    console.log("error",error)
})

