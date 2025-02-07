import mongoose from "mongoose"
import {videoModel} from "../models/video.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import cloudinary from "../utils/cloudinary.js"

const getVideos = asyncHandler(async(req,res)=>{
    const user = req.user
    if(!user) return res.status(404).json({message : "user is missing"})
    const video = await videoModel.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $project : {
                videofile : 1,
                thumbnail : 1,
                title : 1,
                description : 1,
                duration : 1,
                views : 1,
                isPublished : 1 
            }
        }
    ])
    if((!video) || (video.length==0)) return res.status(500).json({message : "no video found"})
    return res.status(200).send(video[0])
})

const uploadVideo = asyncHandler(async(req,res)=>{
    // console.log(req.files.video)
    return res.status(200).json({message : "file upload success"})
})

export {
    getVideos,
    uploadVideo
}