import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended : true}))

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