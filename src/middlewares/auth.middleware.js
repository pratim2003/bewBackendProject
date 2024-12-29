import {userModel} from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const auth =asyncHandler(async(req,res,next)=>{
    try {
        const accessToken = req.cookies?.accessToken || req.headers?.Authorization.replace("Bearer ","")
        if(!accessToken) return res.status(401).json({"message" : "Unauthorized"})
        
        const authorized = jwt.verify(accessToken,process.env.ACCESS_SECRET_TOKEN)
    
        if(!authorized) return res.status(401).json({"message" : "Unauthorized"})
        
        const user = await userModel.findById(authorized._id).select("-password -refreshToken")
    
        req.user = user
    
        next()
    } catch (error) {
        res.status(500).json({"message" : "something went wrong in server"})
    }
})