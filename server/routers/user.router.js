import { Router } from "express"
import { addWorker, deleteWorker, login, register, getWorkers, updateWorker,getUserByToken, myUpdateWorker } from "../controllers/user.controller.js";
import { validateJoiSchema } from "../middlewares/validation.middleware.js";
import { validUser } from "../models/user.model.js";
import {auth} from "../middlewares/token.middleware.js"
import { upload } from "../middlewares/upload.middleware.js";
import { checkPer } from "../middlewares/permission.middleware.js";

const router=Router();




////////////////CUSTOMER + WORKER + ADMIN/////////////////////

//login
router.post('/login',validateJoiSchema(validUser.login), login);

//Register
router.post('/register', upload.single("picture"), validateJoiSchema(validUser.Register), register);

//update worker his data
router.put('/update',auth, upload.single("picture"), myUpdateWorker);

///////////////////WORKER////////////////////////

//get the user data from the token id
router.post('/token',auth, getUserByToken);


//////////////////ADMIN/////////////////////
//get workers
router.post('/',auth,checkPer(["admin"]),getWorkers);

//add Worker
router.post('/add',auth,checkPer(["admin"]), upload.single("picture"),validateJoiSchema(validUser.Register), addWorker);

//delete Worker
router.delete('/:email',auth,checkPer(["admin"]),validateJoiSchema(validUser.delete), deleteWorker);

//update worker other data
router.put('/:email',auth,checkPer(["admin"]),upload.single("picture"), updateWorker);

export default router;
