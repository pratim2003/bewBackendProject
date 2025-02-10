import {subscribe,unsubscribe,isSubscribed} from "../controllers/subscription.controllers.js"
import { Router } from "express"
import { auth } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/subscribe/:id",auth,subscribe)
router.delete("/unsubscribe/:id",auth,unsubscribe)
router.post("/issubscribe/:id",auth,isSubscribed)
export default router