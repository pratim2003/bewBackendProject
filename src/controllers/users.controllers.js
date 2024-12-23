import { userModel } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const handleGetData = asyncHandler(async(req,res)=>{
    res.status(200).json({
        mssg : "hello Pratim"
    })
})

export {handleGetData}