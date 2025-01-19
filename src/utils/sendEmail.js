import nodemailer from "nodemailer"
const OTP = Math.floor(Math.random()*10001)

const SendEmail = async(options)=>{
    try {
        const auth = nodemailer.createTransport({
            service : process.env.EMAIL_SERVICE,
            secure : false,
            port : 465,
            auth : {
                user : process.env.EMAIL,
                pass : process.env.LESSPASS
            }
        })
        
        const responce = {
            from : process.env.EMAIL,
            to : options.email,
            subject : "OTP for password",
            text : `your otp is ${OTP}`
        }
    
        return await auth.sendMail(responce)
    } catch (error) {
        console.log("error sending message",error)
    }
}

const sendEmail = async(email)=>{
    try {
        const res = SendEmail({email})
        if(res) return OTP
        return null
    } catch (error) {
        console.log(error)
    }
}

export default sendEmail