import { Router } from "express";
import {
    handleGetData,
    hadleUploadData,
    handleLogIn,
    handleLogOut,
    refreshAccessToken,
    changePassword,
    forgetPassword,
    otpVerify,
    passwordChange,
    updateProfile,
    updateAvatar,
    updateCoverImage,
    subcriptionHandler,
    watchHistory,
    updateWatchHistory
} from "../controllers/users.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import {auth} from "../middlewares/auth.middleware.js"
import verifyEmail,{veryfyOtp} from "../middlewares/verifyEmail.js";

const router  = Router()

router.get("/get",auth,handleGetData)
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
router.post("/updateProfile",auth,updateProfile)
router.post("/refreshAccessToken",refreshAccessToken)
router.post("/changePassword",auth,changePassword)
router.post("/changeAvatarUpdate",upload.single("avatar"),auth,updateAvatar)
router.post("/changeCoverImage",upload.single("coverImage"),auth,updateCoverImage)
router.post("/forgetPassword",verifyEmail,forgetPassword)
router.post("/otpVerify",veryfyOtp,otpVerify)
router.post("/passwordCahngeWithoutAuth",veryfyOtp,passwordChange)
router.post("/channel",auth,subcriptionHandler)
router.post("/watchHisory",auth,watchHistory)
router.post("/updateWatchHistory/:id",auth,updateWatchHistory)
export default router