import {subscriptionModel} from "../models/subscription.model.js"
import asyncHandler from "../utils/asyncHandler.js"

const subscribe = asyncHandler(async(req,res)=>{
    const id = req.params.id
    if(!req.user) return res.status(404).json({message : "no user found"})
    if(!id) return res.status(404).json({message : "no id found"})
    if(req.user._id==id) return res.status(400).json({message : "you cant subscribe yourself"})
    const data = await subscriptionModel.create({
        Subscriber : id,
        channel : req.user._id
    })
    if(!data) return res.status(500).json({message : "internal servar problem"})
    return res.status(200).json({message : "subscribed"})
})

export{
    subscribe
}