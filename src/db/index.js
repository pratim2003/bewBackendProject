import mongoose from "mongoose";
import dbName from "../constant.js";
const url = process.env.mongoDb_Url
const connect =async()=> {
    try {
        const intance = await mongoose.connect(`${url}/${dbName}`).then(()=>console.log("database connected")).catch(()=>console.log("mongodb connection failed"))
        // console.log(intance)
    } catch (error) {
        console.log({mssg : "mongodb connection failed"})
        console.log(error)
    }
}


export default connect