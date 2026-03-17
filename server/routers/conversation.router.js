import { Router } from "express";
import Conversation, { validConverContent } from "../models/conversation.model.js";
import { create, getAllConver, getconverByEmail, update, getconverById } from "../controllers/conversation.controller.js";
import {deleteQ} from "../middlewares/queue.middleware.js"
import { validateJoiSchema } from "../middlewares/validation.middleware.js";
import { auth } from "../middlewares/token.middleware.js";
import {checkPer} from "../middlewares/permission.middleware.js"



const router=Router();

//create
router.post('/',auth,checkPer(["admin", "worker"]), deleteQ, create);

//update
router.patch('/',validateJoiSchema(validConverContent), update);

//get by email
router.get('/:email',auth,checkPer(["customer"]),getconverByEmail)

//get by _id
router.post('/:_id',getconverById)

//get all conversation
router.get('/',auth,checkPer(["admin"]),getAllConver)

export default router;
