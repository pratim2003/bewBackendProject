import mongoose from "mongoose";
import mongooseaggregatepaginatev2 from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    videofile :{
        type : String,
        required : true,
    },
    thumbnail : {
        type : String,
        required : true
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    tile : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required: true
    },
    duration : {
        type : Number,
        default : 0
    },
    views : {
        type : Number,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    }
},{timestamps : true})


userSchema.plugin(mongooseaggregatepaginatev2)
export const videoModel = mongoose.model("Video", videoSchema)