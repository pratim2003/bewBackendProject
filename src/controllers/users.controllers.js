import { userModel } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import CloudinaryFileUpload from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"



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


const handleLogIn = asyncHandler(async(req,res)=>{
   
    const {userName , email , password} = req.body
    if(!(userName || email || password)) return res.status(400).json({"message" : `username email and password is required`})

    const existedUser = await userModel.findOne({
        $or : [
            {userName , email}
        ]
    })
    if(!existedUser) return res.status(404).json({"message" : "User not found"})
    
    const isVerify = await existedUser.isVerified(password)
    if(!isVerify) return res.status(401).json({"message" : "Password incorrect"})

    const accessToken = await existedUser.AccessToken()
    const refreshToken = await existedUser.RefreshToken()

    existedUser.refreshToken = refreshToken

    const user = await existedUser.save({validateBeforeSave : false})

    if(!user) return res.status(500).json({"message" : "something went wrong while saving"})

    const user2 = await userModel.findById(user._id).select("-password -refreshToken")
    if(!user2) return res.status(500).json({"message" : "something went wrong while saving"})
    
    const option = {
        httpOnly : true,
        secure : true
    }

    res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json({
        "message" : "user logged in success",
        user : user2
    })

})

const handleLogOut = asyncHandler(async(req,res)=>{
    const user = req.user
    const logedUser = await userModel.findById(user._id).select("-password -refreshToken")
    if(!logedUser) return res.status(404).json({"message" : "user not found"})
    // const updatedUser = await userModel.findByIdAndUpdate(logedUser._id,{
    //     $set : {
    //         refreshToken : undefined
    //     }
    // },{new : true})
    logedUser.refreshToken = undefined
    const updatedUser = await logedUser.save({validateBeforeSave : false})
    if(!updatedUser) return res.status(500).json({"message" : "something went wrong while updating the data"})

    const option = {
        httpOnly : true,
        secure : true
    }

    res.status(200).clearCookie("accessToken",option).clearCookie("refreshToken",option).json({"message" : "User logged out successfully"})
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const cookieRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers?.refreshToken
    if(!cookieRefreshToken) return res.status(401).json({"message" : "unauthorized access"})
    try {
        const decodeToken = jwt.verify(cookieRefreshToken,process.env.REFRESH_SECRET_TOKEN)
        if(!decodeToken) return res.status(401).json({"message" : "Invalid refreshToken"})
        const user = await userModel.findById(decodeToken._id)
        if(!user) return res.status(401).json({"message" : "Invalid refreshToken"})
        if(cookieRefreshToken !== user.refreshToken) return res.status(401).json({"message" : "Invalid refreshToken"})
        const accessToken = await user.AccessToken()
        if(!accessToken) return res.status(500).json({"message" : "Something went wrong"})
        const option = {
            httpOnly : true,
            secure : true
        }
        res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",cookieRefreshToken,option).json({
            "message" : "AccessToken Refresh"
        })
    } catch (error) {
        res.status(500).json({"error" : error})
    }
})

export {handleGetData,hadleUploadData,handleLogIn,handleLogOut,refreshAccessToken}