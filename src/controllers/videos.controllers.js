import mongoose from "mongoose"
import {videoModel} from "../models/video.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import cloudinary from "../utils/cloudinary.js"
import path from "path"

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
    return res.status(200).send(video)
})

const uploadVideo = asyncHandler(async(req,res)=>{
    if(!(req.files.video && req.files.thumbnail)) return res.status(400).json({message : "file is required"})
    const {title,description,isPublished} = req.body
    const videoFileExt = path.extname(req.files.video[0].originalname).replace(".","")
    const thumbnailExt = path.extname(req.files.thumbnail[0].originalname).replace(".","")
    const thumbnailallowedExt = ["jpg","jpeg","png","svg"]
    const VideoallowdExt = ["mp4","mov","avi","mkv","flv","webm"]
    if(!VideoallowdExt.includes(videoFileExt)) return res.status(400).json({message : "only videos allowed in video section"})
    if(!thumbnailallowedExt.includes(thumbnailExt)) return res.status(400).json({message : "image extension not allowed thumbnail section"})
    const videoFilePath = req.files.video[0].path
    const thumbnailPath = req.files.thumbnail[0].path
    const videoUrl = await cloudinary(videoFilePath)
    const thumbnailUrl = await cloudinary(thumbnailPath)
    const video = await videoModel.create({
        videofile : videoUrl.url,
        thumbnail : thumbnailUrl.url,
        owner : req.user._id,
        title : title,
        description : description,
        duration : Math.floor(videoUrl.duration),
        views : 0,
        isPublished : isPublished
    })
    if(!video) return res.status(500).json({message : "something went wrong while uploading"})
    return res.status(200).json({message : "file upload success",video})
})

const updateDetails = asyncHandler(async(req,res)=>{
    const id = req.params.id
    const video = await videoModel.findById(id)
    if(String(req.user._id)!=String(video.owner)) return res.status(404).json({message : "video is not autherized"})
    const {title,description,isPublished} = req.body
    if(!(title && description && isPublished)) return res.status(400).send({message : "every field is required"})
    const updatedVideo = await videoModel.updateOne({_id : video._id},{
        $set : {
            title : title,
            description : description,
            isPublished : isPublished
        }
    })
    if(!updatedVideo) return res.status(500).json({message : "something went wrong while upfating"})
    const realVideo = await videoModel.findById(video._id).select("-owner -duration")
    return res.status(200).json({
        message : "data updated", 
        video : realVideo
    })
})

const upadteVideodetails = asyncHandler(async(req,res)=>{
    if(!req.files) return res.status(400).json({message : "video or thumbnail files is required"})
    const id = req.params.id
    if(!id) return res.status(400).json({message : "id not found"})
    const video = await videoModel.findById(id)
    if(req.user.id!=video.owner) return res.status(404).json({message : "not authorized"})
    let videoFilePath;
    let thumbnailPath;
    if(req.files.video){videoFilePath = req.files.video[0].path}
    if(req.files.thumbnail){thumbnailPath = req.files.thumbnail[0].path}
    let videoUrl;
    let thumbnailUrl;
    if(videoFilePath){videoUrl = await cloudinary(videoFilePath)}
    if(thumbnailPath){thumbnailUrl = await cloudinary(thumbnailPath)}
    if(videoUrl){await videoModel.findByIdAndUpdate(video._id,{videofile : videoUrl.url})}
    if(thumbnailUrl){await videoModel.findByIdAndUpdate(video._id,{thumbnail : thumbnailUrl.url})}
    const updatedVideo = await videoModel.findById(video._id)
    return res.status(200).json({message : "updated",video : updatedVideo})
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const id = req.params.id
    if(!id) return res.status(400).json({message : "id not found"})
    const video = await videoModel.findById(id)
    if(req.user.id!=video.owner) return res.status(404).json({message : "not authorized"})
    await videoModel.findByIdAndDelete(video._id)
    return res.status(200).json({message : "video deleted"})
})

const getAnyVideo = asyncHandler(async(req,res)=>{
    const id = req.params.id
    if(!id) return res.status(400).json({message : "id not found"})
    const video = await videoModel.findById(id)
    if(!video) return res.status(400).json({message : "no video found"})
    return res.status(200).json({video})
})

export {
    getVideos,
    uploadVideo,
    updateDetails,
    deleteVideo,
    upadteVideodetails,
    getAnyVideo
}