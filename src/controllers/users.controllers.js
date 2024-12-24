import { userModel } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const handleGetData = asyncHandler(async(req,res)=>{

    const body = req.body


    res.status(200).json({
        mssg : "hello Pratim"
    })
})

const hadleUploadData= asyncHandler(async(req,res)=>{

})

export {handleGetData,hadleUploadData}