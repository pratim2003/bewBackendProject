import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
//app middlewares
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static("src/uploads"))


//cors
const whiteList = []

const corsOption = {
    origin : (origin,callback)=>{
        if(!origin || whiteList.includes(origin)){
            callback(null,true)
        }else{
            callback(new Error("you can't access it"))
        }
    }
}

app.use(cors(corsOption))


//import routes
import userRouter from "./routes/users.routes.js"
import videoRouter from "./routes/videos.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"

app.use("/api/user",userRouter)
app.use("/api/video",videoRouter)
app.use("/api/subcription",subscriptionRouter)

export {app}