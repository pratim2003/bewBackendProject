import cron from "node-cron"
import { userModel } from "../models/user.model.js"

const deleteRefreshTokenc = (id)=>{
    cron.schedule("0 0 * * *",async()=>{
        const updateData = await userModel.findByIdAndUpdate(id,{
            $unset :{refreshToken : 1}
        },{
            new : true
        })
        console.log(updateData,"refreshToken deleted")
    })
}

export default deleteRefreshTokenc