import dotenv from "dotenv"
import connect from './db/index.js'
import {app} from "./app.js";

dotenv.config({
    path : "./.env"
})
connect().then(()=>{
    app.on("error",(error)=>{
        console.log(error)
    })
    app.listen(process.env.port,()=>console.log(`port starting on ${process.env.port}`))
}).catch((error)=>{
    console.log("error",error)
})

