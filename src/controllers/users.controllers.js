import { userModel } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const handleGetData = asyncHandler(async(req,res)=>{

    const body = req.body


    res.status(200).json({
        mssg : "hello Pratim"
    })
})

const hadleUploadData= asyncHandler(async(req,res)=>{
    const {userName , email , fullName, password} = req.body

    // if([userName , email , fullName, password].some((field) => field.trim() === "")) return res.status(400).json({
    //     error : "All fields are required"
    // })

    // const existedUser = await userModel.findOne({
    //     $or : [
    //         {userName : userName},{email : email}
    //     ]
    // })
    // if(existedUser) return res.status(409).json({
    //     error : "User alredy exists"
    // })

    if(req.files){
        console.log(req.files)
    }



    res.status(200).json({
        message : "Data saved successfully"
    })
})

export {handleGetData,hadleUploadData}