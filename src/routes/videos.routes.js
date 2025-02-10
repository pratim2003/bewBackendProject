import {getVideos,uploadVideo,updateDetails,deleteVideo,upadteVideodetails,getAnyVideo} from "../controllers/videos.controllers.js"
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
router.patch("/updateVideo/:id",auth,upload.fields([
    {
        name : "video",
        maxCount : 1
    },
    {
        name : "thumbnail",
        maxCount : 1
    }
]),upadteVideodetails)
router.patch("/updateDetails/:id",auth,updateDetails);
router.delete("/delete/:id",auth,deleteVideo)
router.post("/getVideo/:id",auth,getAnyVideo)

export default router