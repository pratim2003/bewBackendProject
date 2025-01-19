import nodemailer from "nodemailer"
const OTP = Math.floor(Math.random()*10001)

const SendEmail = async(options)=>{
    try {
        const auth = nodemailer.createTransport({
            service : "gmail",
            secure : false,
            port : 465,
            auth : {
                user : "duttapratim003@gmail.com",
                pass : "pvbi akwl uinj mbzm"
            }
        })
        
        const responce = {
            from : "duttapratim003@gmail.com",
            to : options.email,
            subject : "OTP for password",
            text : `your otp is ${OTP}`
        }
    
        await auth.sendMail(responce)
    } catch (error) {
        console.log("error sending message",error)
    }
}

const sendEmail = async(email)=>{
    const res = await SendEmail(email)
    if(res) return OTP
    return null
}

export default sendEmail