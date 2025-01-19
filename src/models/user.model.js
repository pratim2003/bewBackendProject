import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    fullName : {
        type : String,
        required : true,
        trim : true,
    },
    avatar : {
        type : String,
        required : true,
    },
    coverImage : {
        type : String,
    },
    password : {
        type : String,
        required : [true, "Password is required"]
    },
    refreshToken : {
        type : String
    },
    watchHistory : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    otp : {
        type : String
    }
},{timestamps : true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    
    next()
})

userSchema.pre("save",async function (next) {
    if(!(this.isModified("otp"))) return next()
    if(this.otp==undefined) return next()
    this.otp = await bcrypt.hash(this.otp,10)

    next()
})

userSchema.methods.verifyOtp = async function(otp){
    return await bcrypt.compare(otp,this.otp)
}

userSchema.methods.isVerified = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.AccessToken = function(){
    return jsonwebtoken.sign(
        {
            _id : this._id,
            userName : this.userName,
            email : this.email,
            fullName : this.fullName
        },
        process.env.ACCESS_SECRET_TOKEN,
        {
            expiresIn : process.env.ACCESS_EXPIRES_IN
        }
    )
}

userSchema.methods.RefreshToken = function(){
    return jsonwebtoken.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_SECRET_TOKEN,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

export const userModel = mongoose.model("User", userSchema)