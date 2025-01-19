import {userModel} from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"

const verifyEmail = asyncHandler(async(req,res,next)=>{
    const {email} = req.body

    const user = await userModel.findOne({email : email})
    if(!user) return res.status(400).json({message : "wrong email or email doest not exit or email does not have signed up"})
    const newUser = await userModel.findById(user._id).select("-password -refreshToken -otp")
    req.user = newUser
    next()
})

const veryfyOtp = asyncHandler(async (req,res,next)=>{
    const id = req.cookies?.id
    const user = await userModel.findById(id).select("-password -otp -refreshToken")
    if(!user) return res.status(400).json({message : "can't find the user"})
    req.user = user
    next()
})

export default verifyEmail
export {veryfyOtp}