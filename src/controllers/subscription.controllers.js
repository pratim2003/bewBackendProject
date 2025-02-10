import mongoose from "mongoose"
import {subscriptionModel} from "../models/subscription.model.js"
import asyncHandler from "../utils/asyncHandler.js"

const subscribe = asyncHandler(async(req,res)=>{
    const id = req.params.id
    if(!req.user) return res.status(404).json({message : "no user found"})
    if(!id) return res.status(404).json({message : "no id found"})
    if(req.user._id==id) return res.status(400).json({message : "you cant subscribe yourself"})
    const subDetail = await subscriptionModel.aggregate([
        {
            $match : {
                Subscriber : new mongoose.Types.ObjectId(req.user._id),
                channel : new mongoose.Types.ObjectId(id)
            }
        }
    ])
    if(subDetail.length>0) return res.status(400).json({message : "already subscribed"})
    const data = await subscriptionModel.create({
        Subscriber : req.user._id,
        channel : id
    })
    if(!data) return res.status(500).json({message : "internal servar problem"})
    console.log(subDetail)
    return res.status(200).json({message : "subscribed"})
})
const unsubscribe = asyncHandler(async(req,res)=>{
    const channelId = req.params.id
    const subscriberId = req.user._id
    const id = await subscriptionModel.aggregate([
        {
            $match : {
                Subscriber : new mongoose.Types.ObjectId(subscriberId),
                channel : new mongoose.Types.ObjectId(channelId),
            }
        }
    ])
    if(!(id.length>0)) return res.status(400).json({message : "you are not not subscriber of this channel"})
    await subscriptionModel.findByIdAndDelete(id[0]._id)
    return res.status(200).json({message : "unsubscribed successful"})
})

const isSubscribed = asyncHandler(async(req,res)=>{
    const subscriberId = req.user._id
    const channelId = req.params.id
    const check = await subscriptionModel.aggregate([
        {
            $match : {
                Subscriber : new mongoose.Types.ObjectId(subscriberId),
                channel : new mongoose.Types.ObjectId(channelId),
            }
        }
    ])
    console.log(check)
    if(check.length>0) return res.status(200).json({check : true,message : "subscribed"})
    return res.status(200).json({check : false,message : "unsubcribed"})
})

export{
    subscribe,
    unsubscribe,
    isSubscribed
}