import {getVideos,uploadVideo} from "../controllers/videos.controllers.js"
import {auth} from "../middlewares/auth.middleware.js"
import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.get("/get",auth,getVideos)
router.post("/upload",auth,upload.fields([
    {
        name : "video",
        maxCount : 1
    },
    {
        name : "thumbnail",
        maxCount : 1
    }
]),uploadVideo)

export default router