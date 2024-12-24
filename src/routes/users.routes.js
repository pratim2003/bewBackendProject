import { Router } from "express";
import {handleGetData,hadleUploadData} from "../controllers/users.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"

const router  = Router()

router.get("/get",handleGetData).post("/post",upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1
    }
]),hadleUploadData)


export default router