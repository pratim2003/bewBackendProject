import { Router } from "express";
import {handleGetData,hadleUploadData,handleLogIn,handleLogOut,refreshAccessToken,changePassword, forgetPassword,otpVerify,passwordChange} from "../controllers/users.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import {auth} from "../middlewares/auth.middleware.js"
import verifyEmail,{veryfyOtp} from "../middlewares/verifyEmail.js";

const router  = Router()

router.get("/get",handleGetData)
router.post("/register",upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1
    }
]),hadleUploadData)
router.post("/login",handleLogIn)
router.delete("/logout",auth,handleLogOut)
router.post("/refreshAccessToken",refreshAccessToken)
router.post("/changePassword",auth,changePassword)
router.post("/forgetPassword",verifyEmail,forgetPassword)
router.post("/otpVerify",veryfyOtp,otpVerify)
router.post("/passwordCahngeWithoutAuth",veryfyOtp,passwordChange)
export default router