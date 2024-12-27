import { userModel } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import CloudinaryFileUpload from "../utils/cloudinary.js"

const handleGetData = asyncHandler(async(req,res)=>{

    const body = req.body

    const user = await userModel.find({})

    res.status(200).json({
        user : user
    })
})

const hadleUploadData= asyncHandler(async(req,res)=>{
    const {userName , email , fullName, password} = req.body

    if([userName , email , fullName, password].some((field) => field.trim().replace(/\s+/g,"") === "")) return res.status(400).json({
        error : "All fields are required"
    })

    const existedUser = await userModel.findOne({
        $or : [
            {userName : userName},{email : email}
        ]
    })
    if(existedUser) return res.status(409).json({
        error : "User alredy exists"
    })

    const avatarLocalPath = req.files?.avatar[0].path
    // const coverImagePath = req.files?.coverImage[0]?.path

    let coverImagePath;
    let coverImage;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = req.files.coverImage[0].path
        coverImage = await CloudinaryFileUpload(coverImagePath)
    }

    if(!avatarLocalPath) return res.status(400).json({
        error : "avatar image is required"
    })

    const avatar = await CloudinaryFileUpload(avatarLocalPath)
    
    const createdUser = await userModel.create({
        userName : userName.toLowerCase().trim().replace(/\s+/g,""),
        email : email,
        fullName,
        password,
        avatar : avatar.url,
        coverImage : coverImage? coverImage.url : ""
    })

    const user = await userModel.findById(createdUser._id).select(
        "-password -refreshToken"
    )

    if(!user) return res.status(500).json({error : "somthing went wrong when unploading on server"})

    res.status(201).json({
        message : "New User created",
        user : user
    })
    
})

export {handleGetData,hadleUploadData}