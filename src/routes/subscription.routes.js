import {subscribe} from "../controllers/subscription.controllers.js"
import { Router } from "express"
import { auth } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/subscribe/:id",auth,subscribe)

export default router