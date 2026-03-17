import { Router } from "express"
import { validQueue } from "../models/queue.model.js";
import { add } from "../controllers/queue.controller.js";
import { validateJoiSchema } from "../middlewares/validation.middleware.js";
import {auth} from "../middlewares/token.middleware.js"


const router=Router();

//add
router.post('/',auth,validateJoiSchema(validQueue), add);

export default router;
