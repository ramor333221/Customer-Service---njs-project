import mongoose, { model,Schema } from "mongoose";
import Joi from 'joi'

const conversationSchema=new Schema({
    date:Date,
    emailWorker:{ type: String, required: true, lowercase: true },
    nameWorker:String,
    workerPictureUrl:String,
    customerPictureUrl:String,
    emailCustomer:{ type: String, required: true, lowercase: true },
    topic:{type:String,  enum:['Complaint','Request for help','Other']},
    converContent:[{
        description:String,
        writer:{type:String, enum:['worker', 'customer']},
        time:Date
    }],
});

export const validConverContent = Joi.object({
    _id: Joi.string().required(),
    converContent: Joi.array().items(Joi.object({
        description: Joi.string().required(),
        writer: Joi.string().valid('worker', 'customer').required(), // Include writer validation if needed
    })).required()
});




const Conversation=model('conversations',conversationSchema);
export default Conversation;
