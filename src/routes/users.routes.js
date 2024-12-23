import { Router } from "express";
import {handleGetData} from "../controllers/users.controllers.js"

const router  = Router()

router.get("/get",handleGetData)


export default router