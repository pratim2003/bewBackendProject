import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.Cloudinary_Cloud_Name,
    api_key : process.env.Cloudinary_Api_Key,
    api_secret : process.env.Cloudinary_Api_Secret
 })

const CloudinaryFileUpload = async (filename)=>{
    try {
        const response = await cloudinary.uploader.upload(filename,{
            resource_type : 'auto'
        })
        if(!response) return null
        return response
    } catch (error) {
        fs.unlinkSync(filename)
        console.log({error : error})
    }
}

export default CloudinaryFileUpload