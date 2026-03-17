import {model, Schema} from "mongoose";
import Joi from 'joi'

const queueSchema = new Schema({
    queue: [{
        _id: { type: Schema.Types.ObjectId, auto: true }, // Add this line to create an _id for each item
        emailCustomer: { type: String, required: true },
        topic: { type: String, enum: ['Complaint', 'Request for help', 'Other'], required: true } ,
        customerPictureUrl:String,
    }]
});

export const validQueue = Joi.object({
    topic: Joi.string().valid('Complaint', 'Request for help', 'Other').required(),
});

const Queue = model('queues', queueSchema);
export default Queue;
