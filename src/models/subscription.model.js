import mongoose from "mongoose";

const subcriptionSchema = new mongoose.Schema({
    Subscriber : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    channel : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})

const subscriptionModel = mongoose.model("Subcription",subcriptionSchema)

export {
    subscriptionModel
}