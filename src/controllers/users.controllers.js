import { userModel } from "../models/user.model.js";
import {videoModel} from "../models/video.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import CloudinaryFileUpload from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import sendEmail  from "../utils/sendEmail.js";
import mongoose from "mongoose";


const handleGetData = asyncHandler(async(req,res)=>{

    if(!req.user) return res.status(404).json({message : "No user found"})
    const id = req.user?._id

    const user = await userModel.findById(id).select("-password -refreshToken -otp")

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
            {userName : userName.split(" ").join("").toLowerCase()},{email : email.toLowerCase()}
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
        email : email.toLowerCase(),
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
    if(!existedUser.refreshToken=="") {
        return res.status(409).json({
            message : "already logged in"
        })
    }
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

const changePassword = asyncHandler(async(req,res)=>{
    const user = await userModel.findById(req.user._id)

    const {oldPassword,newPassword,confPassword} = req.body

    if(!(oldPassword || newPassword || confPassword)) return 

    if(newPassword!=confPassword) return res.status(400).json({message : "newPassword and confirm password are not same"})
        
    const isPasswordCorrect = await user.isVerified(oldPassword)
    if(!isPasswordCorrect) return res.status(400).json({message : "password incorrect"})
    
    user.password = confPassword

    const User = await user.save({validateBeforeSave : false})
    const newUser = await userModel.findById(User._id).select("-password -refreshToken")

    res.status(200).json({
        user : newUser,
        message : "password changed successfully :)"
    })
})

const forgetPassword = asyncHandler(async(req,res)=>{
    const {email} = req.body

    const otp = await sendEmail(email)

    const user = req.user

    const user2 = await userModel.findById(user._id)

    user2.otp = otp

    const newUser = await user2.save({validateBeforeSave : false})

    if(!newUser) return res.status(500).json({message : "somwthing went wrong while sending otp"})
    const option = {
        httpOnly : true,
        secure : true
    }
    return res.status(200).cookie("id",newUser._id,option).json({message : "otp send"})
})

const otpVerify = asyncHandler(async(req,res)=>{
    const user = req.user
    const {otp} = req.body
    const newUSer = await userModel.findById(user._id)
    const verifyOtp = await newUSer.verifyOtp(otp)
    if(!verifyOtp) return res.status(400).json({message : "Wrong OTP"})
    const option = {
        httpOnly : true,
        secure : true
    }
    
    return res.status(200).cookie("id",newUSer._id,option).send({message : "enter your new password"})
})

const passwordChange = asyncHandler(async(req,res)=>{
    const {newPassword,confPassword} = req.body
    if(!(newPassword || confPassword)) return res.status(400).json({message : "all the parametres are needed"})
    if(newPassword != confPassword) return res.status(400).json({message : "newPassword and confirm password are not matched"})
    const user = req.user
    const newUser = await userModel.findById(user._id)
    newUser.password = confPassword
    newUser.otp = undefined
    const user2 = await newUser.save({validateBeforeSave : false})
    if(!user2) return res.status(500).json({message : "something went wrong while updating the password please try again"})
    const option = {
        httpOnly : true,
        secure : true
    }
    return res.status(200).clearCookie("id",option).json({message : "password updated"})
})

const updateProfile = asyncHandler(async(req,res)=>{
    const {userName,fullName,email} = req.body
    const user = req.user
    const user2 = await userModel.findById(user._id)
    if(userName) await userModel.findByIdAndUpdate(user2._id,{userName : userName})
    if(fullName) await userModel.findByIdAndUpdate(user2._id,{fullName : fullName})
    if(email) await userModel.findByIdAndUpdate(user2._id,{email : email})
    return res.status(200).json({message : "data updated"})
})

const updateAvatar = asyncHandler(async(req,res)=>{
    const user = req.user
    if(!req.file) return res.status(400).json({message : "Avatar image needed"})
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) return res.status(500).json({message : "Something went wrong while Avatar image"})
    const avatarImage = await CloudinaryFileUpload(avatarLocalPath)
    if(!avatarImage) return res.status(500).json({message : "something went wrong while uploading on cloudinary"})

    const newUser = await userModel.findByIdAndUpdate(user._id,{avatar : avatarImage?.url})
    if(!newUser) return res.status(500).json({message : "something went wrong while updating tha data"})
    return res.status(200).json({message : "Avatar Image file upload"})
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const user =  req.user

    if(!req.file) return res.status(400).json({message : "coverImage needed"})
    
    const coverImageLocalPath = req.file.path
    if(!coverImageLocalPath) return res.status(500).json({message : "Something went wrong while Cover image"})
    const coverImage = await CloudinaryFileUpload(coverImageLocalPath)
    if(!coverImage) return res.status(500).json({message : "something went wrong while uploading on cloudinary"})

    const newUser = await userModel.findByIdAndUpdate(user._id,{coverImage : coverImage?.url})
    if(!newUser) return res.status(500).json({message : "something went wrong while updating tha data"})
    return res.status(200).json({message : "Cover Image file upload"})
})

const subcriptionHandler = asyncHandler(async(req,res)=>{
    const {userName} = req.body
    if(!userName) return res.status(200).json({message : "username is needed"})

    const channel = await userModel.aggregate([
        {
            $match : {
                userName : userName
            }
        },
        {
            $lookup : {
                from : "subcriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscriber"
            }
        },
        {
            $lookup : {
                from : "subcriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subcribedTo"
            }
        },
        {
            $addFields : {
                totalSubscriber : {
                    $size : "$subscriber"
                },
                totalChannelSubscribedTo : {
                    $size : "$subcribedTo"
                },
                isSubscribedTo : {
                    $cond : {
                        if : {
                            $in : [req.user?._id,"$subscriber.Subscriber"]
                        },
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                userName : 1,
                fullName : 1,
                email : 1,
                subscriber : 1,
                subcribedTo : 1,
                totalSubscriber : 1,
                totalChannelSubscribedTo : 1,
                isSubscribedTo : 1
            }
        }
    ])

    // console.log(channel)

    return res.status(200).send(channel[0])
})

const updateWatchHistory = asyncHandler(async(req,res)=>{
    const id  = req.params.id
    const userId  = req.user._id
    if(!id) return res.status(400).json({message : "id is missing"})
    const video = await videoModel.findById(id)
    if(!video) return res.status(500).json({message : "video deleted or not found"})
    const userData = await userModel.findById(userId)
    if(!userData.watchHistory.includes(video._id)){
    const data = await userModel.findByIdAndUpdate(userId,{
        $push : {
            watchHistory : video._id
        },
    },{
        new : true
    })

    if(!data) return res.status(500).json({message : "something went wrong while updating the watchHistory"})

    const updatedVideo = await videoModel.findByIdAndUpdate(video._id,{
        $inc : {
            views : 1
        }
    },{
        new : true
    })

    if(!updatedVideo) return res.status(500).json({message : "something went wrong while updating the views"})
    }

    return res.status(200).json({message : "data updated"})
})



const watchHistory = asyncHandler(async(req,res)=>{
    if(!req.user) return res.status(404).json({message : "user not found"})
    const history = await userModel.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "videos",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner"
                        }
                    }
                ]
            }
        }
    ])

    if(!history) return res.status(500).json({message : "internal server error"})

    return res.status(200).send(history[0])
})

export {
    handleGetData,
    hadleUploadData,
    handleLogIn,
    handleLogOut,
    refreshAccessToken,
    changePassword,
    forgetPassword,
    otpVerify,
    passwordChange,
    updateProfile,
    updateAvatar,
    updateCoverImage,
    subcriptionHandler,
    watchHistory,
    updateWatchHistory
}